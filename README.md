# 💖 Happy 1st Anniversary

## เริ่มใช้งาน
```bash
npm install
npm run dev
```
แล้วเปิด http://localhost:5173

## ปรับแต่ง
- แก้ข้อความ ชื่อ วันที่เริ่มคบ และความทรงจำทั้งหมดได้ที่ `src/config.js`
- ใส่รูปไว้ที่ `public/photos/` แล้วใส่ path ใน `images` ของแต่ละ moment — ใส่กี่รูปก็ได้
  เช่น `images: ['/photos/1-1.jpg', '/photos/1-2.jpg']` (ค่าเริ่มต้นตั้งชื่อไว้เป็น `เลขmoment-เลขรูป.jpg`)
- ถ้ายังไม่มีรูป จะแสดงเป็นการ์ดสีพร้อม emoji แทน

## Build ไปใช้งานจริง
```bash
npm run build
```
จะได้ไฟล์ในโฟลเดอร์ `dist/` นำไป deploy ที่ Vercel / Netlify ได้เลย
