import PinModal from "./PinModal";

export default function PinModalServerWrapper(props) {
  // 서버 컴포넌트: 환경변수 읽기
  const adminPin = process.env.ADMIN_PIN;
  console.log("Admin PIN from server:", adminPin);
  return <PinModal {...props} adminPin={adminPin} />;
}
