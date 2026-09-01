"""
Eye of Poseidon — Dataset Preparation Script

Configures the Ultralytics YOLOv8 training dataset by generating the required YAML
file pointing to the SeabedObjects-KLSG train and valid splits.
"""

import yaml
from pathlib import Path

def prepare_dataset_yaml(project_root: str):
    """Generate the dataset.yaml file required by YOLOv8."""
    
    root_path = Path(project_root).resolve()
    # The dataset is in the parent directory of eye-of-poseidon
    dataset_path = root_path.parent
    
    config = {
        'path': str(dataset_path),
        'train': 'train/images',
        'val': 'valid/images',
        'test': 'text/images', # Kaggle typo "text" for "test"
        'names': {
            0: 'shipwreck_or_large_structure',
            1: 'debris_or_small_object',
            2: 'pipe_or_cable',
            3: 'natural_or_background_feature'
        }
    }
    
    yaml_path = root_path / 'eye-of-poseidon' / 'ai' / 'training' / 'dataset.yaml'
    
    with open(yaml_path, 'w') as f:
        yaml.dump(config, f, sort_keys=False)
        
    print(f"Created YOLO dataset configuration at: {yaml_path}")
    return yaml_path

if __name__ == "__main__":
    prepare_dataset_yaml(r"c:\Users\tanis\Downloads\side-scan-sonar-object-detection-challenge")
