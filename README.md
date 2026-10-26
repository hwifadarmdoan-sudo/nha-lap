# Nhà Láp

Web game thí nghiệm ảo của Đội thi Khoa Sinh học, Trường ĐHSP Hà Nội.
Học sinh tạo nhân vật, vào tòa A1, đi thang máy lên tầng Sinh, Hóa, Lý và tự tay làm thí nghiệm.

- Học sinh: mở trang chủ.
- Người điều hành: thêm `?dieuhanh` vào cuối đường link, nhập mật khẩu.
- Chạy thử trên máy: `python3 -m http.server` rồi mở http://localhost:8000

Bản hiện tại: phần vỏ tòa nhà + tầng Sinh (đếm bọt khí rong, co và phản co nguyên sinh).
Nhiều người chơi: đang dùng BroadcastChannel (các tab cùng máy thấy nhau); sẽ nối Firebase để các máy khác nhau thấy nhau.
