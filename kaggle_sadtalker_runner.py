"""
Kaggle-ready talking-avatar runner for Shikshak AI.

Why this file:
- You do not have a local GPU.
- Kaggle notebooks can provide a GPU.
- For your use case (one teacher photo -> speaking avatar), SadTalker is a better fit
  than plain Wav2Lip because SadTalker supports:
    single portrait image + audio = talking head video

How to use in Kaggle:
1. Upload this file to your Kaggle notebook, or paste it into a notebook cell.
2. Turn on:
   - Accelerator: GPU
   - Internet: ON
3. Run:

   !python kaggle_sadtalker_runner.py \
       --image /kaggle/input/your-dataset/teacher.jpg \
       --audio /kaggle/input/your-dataset/summary.wav \
       --output /kaggle/working/teacher_avatar.mp4

4. Download the output file from:
   /kaggle/working/teacher_avatar.mp4

Notes:
- Input audio should ideally be WAV for best compatibility.
- If you already have MP3, convert it or try it directly.
- This script installs and runs SadTalker inside Kaggle.
"""

from __future__ import annotations

import argparse
import shutil
import subprocess
import sys
from pathlib import Path


REPO_URL = "https://github.com/OpenTalker/SadTalker.git"
REPO_DIR = Path("/kaggle/working/SadTalker")
RESULTS_DIR = Path("/kaggle/working/sadtalker_results")


def run(cmd: list[str], cwd: Path | None = None) -> None:
    print(f"\n[run] {' '.join(cmd)}")
    subprocess.run(cmd, cwd=str(cwd) if cwd else None, check=True)


def ensure_repo() -> None:
    if REPO_DIR.exists():
      print(f"[info] SadTalker repo already exists: {REPO_DIR}")
      return

    run(["git", "clone", REPO_URL, str(REPO_DIR)])


def ensure_dependencies() -> None:
    # Kaggle currently runs Python 3.12 in many notebook images.
    # SadTalker's pinned requirements target an older stack and can fail on py3.12
    # (for example numpy==1.23.4 trying to build from source).
    run([sys.executable, "-m", "pip", "install", "--upgrade", "pip", "setuptools", "wheel"])

    if sys.version_info >= (3, 11):
        print("[info] Python >= 3.11 detected. Using a Kaggle-friendly compatibility dependency set.")
        compat_packages = [
            "numpy==1.26.4",
            "scipy==1.11.4",
            "numba==0.60.0",
            "face_alignment==1.4.1",
            "imageio==2.34.2",
            "imageio-ffmpeg==0.5.1",
            "librosa==0.10.2.post1",
            "resampy==0.4.3",
            "pydub==0.25.1",
            "kornia==0.7.3",
            "tqdm",
            "yacs==0.1.8",
            "pyyaml",
            "joblib",
            "scikit-image==0.22.0",
            "basicsr==1.4.2",
            "facexlib==0.3.0",
            "gradio",
            "gfpgan",
            "av",
            "safetensors",
        ]
        run([sys.executable, "-m", "pip", "install", *compat_packages], cwd=REPO_DIR)
    else:
        run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], cwd=REPO_DIR)

    # ffmpeg is usually present in Kaggle, but we check and fail early if missing.
    if shutil.which("ffmpeg") is None:
        raise RuntimeError("ffmpeg is not available in this Kaggle environment.")


def ensure_models() -> None:
    checkpoints = REPO_DIR / "checkpoints"
    if checkpoints.exists() and any(checkpoints.iterdir()):
        print(f"[info] Checkpoints already present: {checkpoints}")
        return

    # Official SadTalker repo provides a helper script for model download.
    run(["bash", "scripts/download_models.sh"], cwd=REPO_DIR)


def ensure_input_file(path_str: str, kind: str) -> Path:
    p = Path(path_str)
    if not p.exists():
        raise FileNotFoundError(f"{kind} file not found: {p}")
    return p


def ensure_wav_audio(audio_path: Path) -> Path:
    if audio_path.suffix.lower() == ".wav":
        print(f"[info] Audio already in WAV format: {audio_path}")
        return audio_path

    wav_path = Path("/kaggle/working") / f"{audio_path.stem}.wav"
    print(f"[info] Converting audio to WAV: {audio_path} -> {wav_path}")
    run([
        "ffmpeg",
        "-y",
        "-i",
        str(audio_path),
        str(wav_path),
    ])
    return wav_path


def find_output_video(result_dir: Path) -> Path:
    candidates = sorted(result_dir.rglob("*.mp4"), key=lambda p: p.stat().st_mtime, reverse=True)
    if not candidates:
        raise FileNotFoundError("SadTalker completed, but no output MP4 was found.")
    return candidates[0]


def main() -> None:
    parser = argparse.ArgumentParser(description="Run SadTalker on Kaggle using one image and one audio file.")
    parser.add_argument("--image", required=True, help="Path to teacher image (jpg/png)")
    parser.add_argument("--audio", required=True, help="Path to driven audio (wav/mp3)")
    parser.add_argument("--output", required=True, help="Where to save the final MP4")
    parser.add_argument("--size", default="512", choices=["256", "512"], help="Face render size")
    parser.add_argument("--preprocess", default="crop", choices=["crop", "resize", "full"], help="SadTalker preprocess mode")
    parser.add_argument("--still", action="store_true", help="Use still mode for portrait images")
    parser.add_argument("--enhancer", default="gfpgan", choices=["gfpgan", "RestoreFormer", "none"], help="Face enhancer")
    args = parser.parse_args()

    image_path = ensure_input_file(args.image, "Image")
    audio_path = ensure_input_file(args.audio, "Audio")
    audio_path = ensure_wav_audio(audio_path)
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    RESULTS_DIR.mkdir(parents=True, exist_ok=True)

    ensure_repo()
    ensure_dependencies()
    ensure_models()

    cmd = [
        sys.executable,
        "inference.py",
        "--driven_audio",
        str(audio_path),
        "--source_image",
        str(image_path),
        "--result_dir",
        str(RESULTS_DIR),
        "--preprocess",
        args.preprocess,
        "--size",
        args.size,
    ]

    if args.still:
        cmd.append("--still")

    if args.enhancer != "none":
        cmd.extend(["--enhancer", args.enhancer])

    run(cmd, cwd=REPO_DIR)

    latest_mp4 = find_output_video(RESULTS_DIR)
    shutil.copy2(latest_mp4, output_path)
    print(f"\n[done] Output video saved to: {output_path}")


if __name__ == "__main__":
    main()
