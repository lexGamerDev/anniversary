// ✏️ แก้ไขข้อมูลทั้งหมดได้ที่ไฟล์นี้ไฟล์เดียว

export const config = {
  // ชื่อของเราสองคน
  me: 'Lex',
  partner: 'Nok',

  // วันที่เริ่มคบกัน (ปี-เดือน-วัน)
  startDate: '2025-10-05',

  // ข้อความหน้าแรก
  intro: {
    title: 'Happy 1st Anniversary',
    subtitle: '365 วันที่มีเธอ คือปีที่ดีที่สุดของเค้า',
    message:
      'ขอบคุณที่เดินเข้ามาในชีวิตกันนะ วันนี้ครบ 1 ปีแล้ว\nมาย้อนดูความทรงจำของเราด้วยกันไหม?',
  },

  // เวลาขั้นต่ำต่อ 1 moment ในโหมด Auto (มิลลิวินาที)
  autoplayDelay: 5000,
  // เวลาเปลี่ยนรูปภายในการ์ดเดียวกัน (ถ้า moment มีหลายรูป)
  // ในโหมด Auto จะรอให้วนครบทุกรูปก่อนค่อยไป moment ถัดไป
  photoDelay: 2500,

  // ความทรงจำต่างๆ — ใส่รูปไว้ที่โฟลเดอร์ public/photos แล้วใส่ชื่อไฟล์ใน images
  // ใส่กี่รูปก็ได้ต่อ 1 moment (รูปเดียวก็ได้)
  // ถ้ายังไม่มีรูป จะแสดงเป็นการ์ดสีพร้อม emoji แทน
  moments: [
    {
      date: 'December 2025',
      title: 'วันธรรมดาที่พิเศษ',
      caption: 'แค่นั่งดูหนังด้วยกัน ก็เป็นวันที่ดีที่สุดแล้ว',
      images: ['/photos/0.1.jpeg', '/photos/0.2.jpeg', '/photos/0.3.jpeg', '/photos/0.4.jpeg', '/photos/0.5.jpeg'],
      emoji: '✨',
    },
    {
      date: 'December 2025',
      title: 'เที่ยวท้ายปี',
      caption: 'เป็นครั้งแรกที่ได้นอนด้วยกัน',
      images: ['/photos/1.1.jpeg', '/photos/1.2.jpeg', '/photos/1.3.jpeg', '/photos/1.4.jpeg'],
      emoji: '✨',
    },
    {
      date: 'January 2026',
      title: 'เดตแรกของปี',
      caption: 'ได้ทำกิจกรรมใหม่ๆ ร่วมกัน',
      images: ['/photos/2.1.jpeg', '/photos/2.2.jpeg', '/photos/2.3.jpeg', '/photos/2.4.jpeg', '/photos/2.5.jpeg'],
      emoji: '✨',
    },
    {
      date: 'February 2026',
      title: 'วาเลนไทน์ของเรา',
      caption: 'ดอกไม้ช่อเล็กๆ กับความรักที่ใหญ่มาก',
      images: ['/photos/4.1.jpeg', '/photos/4.2.jpeg', '/photos/4.3.jpeg', '/photos/4.4.jpeg'],
      emoji: '🌹',
    },
    {
      date: 'February 2026',
      title: 'วันเกิดของเธอ',
      caption: 'ตื่นเต้นจนกินข้าวแทบไม่ลง แต่ก็มีความสุขมากๆ',
      images: ['/photos/5.1.jpeg', '/photos/5.2.jpeg', '/photos/5.3.jpeg'],
      emoji: '🍰',
    },
    {
      date: 'June 2026',
      title: 'เที่ยวต่างประเทศคด้วยกันรั้งแรกของเรา',
      caption: 'เป็นทริปที่สนุกมากๆ และได้เห็นโลกกว้างขึ้น',
      images: ['/photos/6.1.jpeg', '/photos/6.2.jpeg', '/photos/6.3.jpeg'],
      emoji: '🌊',
    },
    {
      date: 'September 2026',
      title: 'วันรับใบประริญญาของเธอ',
      caption: 'เป็นวันที่สำคัญมากๆ ของเธอ และ เป็นวันที่เค้าภูมิใจในตัวเธอมากที่สุด',
      images: ['/photos/7.1.jpeg', '/photos/7.2.jpeg', '/photos/7.3.jpeg'],
      emoji: '🌹',
    },
  ],

  // ข้อความปิดท้าย (แสดงทีละบรรทัด)
  outro: {
    title: 'ขอบคุณนะ',
    lines: [
      'ขอบคุณที่อยู่ข้างกันมาตลอด 1 ปี',
      'ขอบคุณที่อดทนกับเค้าในวันที่งอแง',
      'ขอบคุณสำหรับทุกเสียงหัวเราะ และทุกอ้อมกอด',
      'ขอบคุณที่ทำให้คำว่า "เรา" มีความหมาย',
      'ปีหน้า และปีต่อๆ ไป… อยู่ด้วยกันแบบนี้นะ',
    ],
    signature: 'รักเธอที่สุดเลย 💖',
  },
}
