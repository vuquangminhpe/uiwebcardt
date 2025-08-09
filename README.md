# Hướng dẫn nhanh API Car Damage Detection

## 1. API `/detect` - Phát hiện damage đơn lẻ

### Request Body

- **Method**: POST
- **Content-Type**: multipart/form-data
- **Parameters**:
  - `file`: File ảnh (JPG, PNG) - **Bắt buộc**

### Request Example

```bash
curl -X POST "https://minh9972t12-yolocar.hf.space/detect" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@car_image.jpg"
```

### Response Format

```json
{
  "status": "success",
  "detections": {
    "boxes": [[x1, y1, x2, y2], ...],
    "classes": ["scratch", "dent", ...],
    "scores": [0.95, 0.87, ...]
  },
  "statistics": {
    "total_damages": 3,
    "damage_types": ["scratch", "dent"]
  },
  "visualized_image_path": "/tmp/detection_20241215_143022_abc123.jpg"
}
```

---

## 2. API `/compare` - So sánh trước/sau giao hàng

### Request Body

- **Method**: POST
- **Content-Type**: multipart/form-data
- **Parameters**: 12 file ảnh (6 cặp before/after)

#### Before Images (trước giao hàng):

- `before_1`: Ảnh vị trí 1 - **Bắt buộc**
- `before_2`: Ảnh vị trí 2 - **Bắt buộc**
- `before_3`: Ảnh vị trí 3 - **Bắt buộc**
- `before_4`: Ảnh vị trí 4 - **Bắt buộc**
- `before_5`: Ảnh vị trí 5 - **Bắt buộc**
- `before_6`: Ảnh vị trí 6 - **Bắt buộc**

#### After Images (sau giao hàng):

- `after_1`: Ảnh vị trí 1 - **Bắt buộc**
- `after_2`: Ảnh vị trí 2 - **Bắt buộc**
- `after_3`: Ảnh vị trí 3 - **Bắt buộc**
- `after_4`: Ảnh vị trí 4 - **Bắt buộc**
- `after_5`: Ảnh vị trí 5 - **Bắt buộc**
- `after_6`: Ảnh vị trí 6 - **Bắt buộc**

### Request Example

```bash
curl -X POST "https://minh9972t12-yolocar.hf.space/compare" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "before_1=@before_pos1.jpg" \
  -F "before_2=@before_pos2.jpg" \
  -F "before_3=@before_pos3.jpg" \
  -F "before_4=@before_pos4.jpg" \
  -F "before_5=@before_pos5.jpg" \
  -F "before_6=@before_pos6.jpg" \
  -F "after_1=@after_pos1.jpg" \
  -F "after_2=@after_pos2.jpg" \
  -F "after_3=@after_pos3.jpg" \
  -F "after_4=@after_pos4.jpg" \
  -F "after_5=@after_pos5.jpg" \
  -F "after_6=@after_pos6.jpg"
```

### Response Format

```json
{
  "status": "success",
  "session_id": "abc12345",
  "timestamp": "2024-12-15T14:30:22.123456",
  "overall_result": {
    "case": "CASE_2_NEW_DAMAGE",
    "message": "Error during vehicle delivery - Detection 2 new damage",
    "statistics": {
      "total_new_damages": 2,
      "total_matched_damages": 1,
      "total_repaired_damages": 0
    }
  },
  "position_results": [
    {
      "position_1": {
        "case": "CASE_2_NEW_DAMAGE",
        "message": "New damage detected",
        "statistics": {
          "new_damages": 1,
          "matched_damages": 0,
          "repaired_damages": 0
        },
        "new_damages": [...],
        "matched_damages": [...],
        "repaired_damages": [...],
        "visualization_path": "/tmp/comparison_20241215_143022_abc12345_pos1.jpg"

      }
    },
    // ... positions 2-6
  ],
  "summary_visualization_path": "/tmp/summary_grid_20241215_143022_abc12345.jpg",
  "recommendations": {
    "action_required": true,
    "suggested_action": "Investigate delivery process"
  }
}
```

---

## 3 Cases phân tích

### CASE 1: Damage có sẵn

- **Kết quả**: "Error from the beginning, not during the delivery process -> Delivery completed"
- **Ý nghĩa**: Damage đã tồn tại từ trước, không phải do quá trình giao hàng

### CASE 2: Damage mới

- **Kết quả**: "Error during vehicle delivery - Detection X new damage"
- **Ý nghĩa**: Phát hiện damage mới, có vấn đề trong quá trình giao hàng

### CASE 3: Thành công

- **Kết quả**: "Successful delivery - No damage detected"
- **Ý nghĩa**: Không có damage, giao hàng thành công

---

## Lưu ý kỹ thuật

- **Định dạng ảnh**: JPG, PNG
- **Server**: https://minh9972t12-yolocar.hf.space
- **Timeout**: Có thể mất vài giây để xử lý
- **File size**: Không giới hạn rõ ràng trong code
- **CORS**: Đã enable cho tất cả origins
