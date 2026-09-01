import math
from typing import Tuple

def estimate_location_offset(
    frame_lat: float, 
    frame_lon: float, 
    heading_deg: float, 
    pixel_x: int, 
    pixel_y: int, 
    image_width: int, 
    image_height: int,
    swath_width_meters: float = 100.0
) -> Tuple[float, float]:
    """Estimate geographical coordinates of a target in a sonar image.
    
    NOTE: This is a simplified estimation for the demo.
    Real mapping requires towfish altitude, slant-range correction, and sound speed.
    
    Args:
        frame_lat, frame_lon: Center coordinates of the frame
        heading_deg: Heading of the AUV/towfish in degrees
        pixel_x, pixel_y: Pixel coordinates of target (usually center of bounding box)
        image_width, image_height: Image dimensions
        swath_width_meters: Total across-track coverage of the sonar
        
    Returns:
        (latitude, longitude)
    """
    if None in [frame_lat, frame_lon, heading_deg]:
        return frame_lat, frame_lon
        
    # Pixels to meters
    meters_per_pixel = swath_width_meters / image_width
    
    # Center of image is assumed to be directly under AUV (nadir)
    center_x = image_width / 2
    center_y = image_height / 2
    
    # Offset in pixels
    dx_px = pixel_x - center_x
    dy_px = center_y - pixel_y # Image Y goes down, Cartesian Y goes up
    
    # Offset in meters (local tangent plane, x=starboard/right, y=forward/heading)
    # Assuming side-scan imagery is mapped to ground range 
    dx_m = dx_px * meters_per_pixel
    dy_m = dy_px * meters_per_pixel
    
    # Rotate offset based on heading (heading is usually clockwise from North)
    # We want dx to be East, dy to be North
    heading_rad = math.radians(heading_deg)
    
    # 2D Rotation matrix
    d_east = dx_m * math.cos(heading_rad) + dy_m * math.sin(heading_rad)
    d_north = -dx_m * math.sin(heading_rad) + dy_m * math.cos(heading_rad)
    
    # Convert meters to degrees (approximate)
    # 1 degree of latitude is ~111,111 meters
    lat_offset = d_north / 111111.0
    
    # 1 degree of longitude is ~111,111 * cos(latitude) meters
    lon_offset = d_east / (111111.0 * math.cos(math.radians(frame_lat)))
    
    return frame_lat + lat_offset, frame_lon + lon_offset
