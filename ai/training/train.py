"""
Eye of Poseidon — YOLOv8 Training Script

Trains a YOLOv8 nano model on the side-scan sonar dataset.
Configured for CPU/local training with appropriate sonar augmentations.
"""

import os
from pathlib import Path
import json

def train_model(
    epochs: int = 50,
    batch_size: int = 8,
    img_size: int = 640,
    device: str = "cpu"
):
    try:
        from ultralytics import YOLO
    except ImportError:
        print("Error: ultralytics is not installed. Please install it first.")
        return

    print("Starting Eye of Poseidon AI Training Pipeline...")
    
    # 1. Load a pretrained YOLOv8 nano model (lightweight, good for MVP/edge)
    model = YOLO('yolov8n.pt')
    
    # 2. Paths
    current_dir = Path(__file__).parent.resolve()
    dataset_yaml = current_dir / 'dataset.yaml'
    project_dir = current_dir.parent.parent / 'models' / 'runs'
    
    # 3. Train the model
    # Note: Side-scan sonar physics restrict some augmentations
    # - fliplr (horizontal flip) is okay
    # - flipud (vertical flip) can mess up shadow orientation relative to nadir, keeping it mild/off
    # - No crazy color jitter since it's grayscale acoustic data
    
    print(f"Training for {epochs} epochs on {device}...")
    results = model.train(
        data=str(dataset_yaml),
        epochs=epochs,
        batch=batch_size,
        imgsz=img_size,
        device=device,
        project=str(project_dir),
        name='sonar_train',
        exist_ok=True,
        # Sonar-appropriate augmentations
        degrees=10.0,      # mild rotation
        translate=0.1,     # mild translation
        scale=0.5,         # scale variation
        shear=0.0,         # no shear, destroys geometry
        perspective=0.0,   # no perspective warp
        flipud=0.0,        # no vertical flip (preserves shadow direction)
        fliplr=0.5,        # horizontal flip is okay (changes port/starboard but valid)
        mosaic=0.5,        # mild mosaic
        mixup=0.0,         # no mixup (blends targets unnaturally)
        copy_paste=0.0,
        patience=20,       # early stopping
        verbose=True
    )
    
    # 4. Save best model to main models directory
    best_model_path = project_dir / 'sonar_train' / 'weights' / 'best.pt'
    target_path = current_dir.parent.parent / 'models' / 'best.pt'
    
    if best_model_path.exists():
        import shutil
        shutil.copy(best_model_path, target_path)
        print(f"Training complete. Best model saved to {target_path}")
        
        # Extract metrics for the UI
        try:
            metrics = {
                'map50': float(results.box.map50),
                'map75': float(results.box.map75),
                'map50-95': float(results.box.map),
                'precision': float(results.box.mp),
                'recall': float(results.box.mr),
                'classes': {}
            }
            
            # Try to get class-specific metrics if available
            try:
                for i, c in enumerate(results.names):
                    metrics['classes'][results.names[c]] = {
                        'map50': float(results.box.maps[i]) if hasattr(results.box, 'maps') and len(results.box.maps) > i else 0.0
                    }
            except Exception as e:
                print(f"Could not extract detailed class metrics: {e}")
                
            metrics_path = current_dir.parent.parent / 'models' / 'metrics.json'
            with open(metrics_path, 'w') as f:
                json.dump(metrics, f, indent=2)
            print(f"Metrics saved to {metrics_path}")
        except Exception as e:
            print(f"Error saving metrics: {e}")
    else:
        print(f"Warning: Could not find best model at {best_model_path}")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('--epochs', type=int, default=15, help='Number of epochs (keep low for MVP/CPU)')
    parser.add_argument('--batch', type=int, default=8, help='Batch size')
    parser.add_argument('--device', type=str, default='cpu', help='Device (cpu, cuda, mps)')
    args = parser.parse_args()
    
    train_model(epochs=args.epochs, batch_size=args.batch, device=args.device)
