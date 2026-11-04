// Curated, paraphrased learning summaries. References identify canonical suttas,
// NOT verbatim translations. Reviewed and presented as summaries, never as quotes.
export const teachings = Object.freeze([
  {
    id:'MN118',name:'Niệm hơi thở — MN 118',group:'Thực hành',
    summary:'Bài kinh trình bày việc biết rõ hơi thở vào và ra, nhận biết hơi thở dài hoặc ngắn, và tiến trình phát triển niệm hơi thở. Việc diễn giải từng bước có sự khác biệt giữa các truyền thống.',
    practice:'Ngồi trong tư thế thoải mái, không gượng ép. Để hơi thở diễn ra tự nhiên và ghi nhận điều thực sự được nhận biết; không cố kéo dài, nín hoặc chỉnh nhịp thở.',
    url:'https://suttacentral.net/mn118/en/bodhi',tags:['hơi thở','niệm','quan sát','tự nhiên','thở']
  },
  {
    id:'MN10',name:'Kinh Niệm xứ — MN 10',group:'Thực hành',
    summary:'Bài kinh đề cập việc quán sát thân, thọ, tâm và pháp. Phân loại này là khung học Phật học; không phải một phép đo tự động để suy ra thành tựu cá nhân.',
    practice:'Khi tâm có những trạng thái khác nhau, có thể học cách nhận biết chúng mà không vội gán nhãn thành tựu.',
    url:'https://suttacentral.net/mn10/en/sujato',tags:['chánh niệm','thân','thọ','tâm','pháp']
  },
  {
    id:'SN56.11',name:'Bài kinh Chuyển Pháp Luân — SN 56.11',group:'Giáo lý',
    summary:'Giới thiệu khuôn khổ Tứ thánh đế và Trung đạo. Đối với người bắt đầu, cần học nguyên văn bản dịch đáng tin cậy và các cách diễn giải khi có bất đồng.',
    practice:'Thay vì chỉ ghi nhớ thuật ngữ, hãy quan sát cách tham ái và phản ứng tâm lý có liên quan đến kinh nghiệm sống của mình.',
    url:'https://suttacentral.net/sn56.11/en/sujato',tags:['tứ thánh đế','khổ','trung đạo','ái']
  },
  {
    id:'AN3.65',name:'Kinh Kālāma — AN 3.65',group:'Phương pháp học',
    summary:'Bài kinh khuyến khích cân nhắc và nhận biết những hành vi đưa đến lợi ích hay tổn hại; không chấp nhận một điều chỉ vì danh tiếng hay uy tín của người nói. Điều này không đồng nghĩa phủ nhận hoàn toàn học hỏi từ người có hiểu biết.',
    practice:'Giữ thái độ cởi mở với chứng cứ, đối thoại và khả năng sửa lại nhận định của mình.',
    url:'https://suttacentral.net/an3.65/en/sujato',tags:['kālāma','kiểm chứng','niềm tin','trí tuệ','đối chiếu']
  }
]);
export const teachingById=Object.fromEntries(teachings.map(x=>[x.id,x]));
export function lookupTeachings(question){
  const normalized=String(question||'').normalize('NFC').toLowerCase().trim();
  const compact=normalized.replace(/\s+/g,'');
  const matches=teachings.map(t=>({t,score:t.tags.reduce((n,word)=>n+(normalized.includes(word)?3:0),0)+(compact.includes(t.id.toLowerCase().replace(/\s+/g,''))?8:0)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).map(x=>x.t);
  return matches.length?matches.slice(0,2):[];
}
export function offlineGuidance(question){
  const matches=lookupTeachings(question);
  if(!matches.length)return {answer:'Tôi chưa có tư liệu đã kiểm chứng cho câu hỏi này trong thư viện phiên bản hiện tại. Con có thể mở Kinh tạng, đọc bản dịch và tiếp tục đặt câu hỏi cụ thể hơn. Tôi không muốn tự đặt ra câu trả lời rồi gán cho kinh điển.',sources:[]};
  const t=matches[0];return {answer:`Đây là bản tóm lược học tập, không phải lời trích nguyên văn kinh điển.\n\n${t.summary}\n\nGợi ý thực hành: ${t.practice}\n\nMuốn hiểu chính xác ý kinh, con nên đọc bản dịch được dẫn ở bên dưới.`,sources:matches.map(x=>x.id)};
}
