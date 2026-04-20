import { useParams, useNavigate } from "react-router-dom";
import { useEffect,useRef } from "react";
import toast from "react-hot-toast";

export default function ScanPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const hasRun = useRef(false);
useEffect(() => {
  if (hasRun.current) return;  
  hasRun.current = true;

  fetch(`http://localhost:3000/products/scan/${id}`)
    .then(res => res.json())
    .then(data => {
      if (data.error) toast.error(data.error);
      else toast.success("Stock reduced");
      navigate("/product");
    });
}, [id]);

  return (
    <div
      style={{
        padding: "2rem",
        textAlign: "center",
        fontSize: "1.2rem",
      }}
    >
      <p>Scanning product...</p>
    </div>
  );
}
