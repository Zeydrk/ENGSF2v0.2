import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Toasters() {
  return (
    <div>
      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar={true}
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
        toastClassName={() =>
          "alert shadow-lg rounded-xl my-2 w-80 text-sm flex items-center gap-2"
        }
        bodyClassName={() => "flex-1 font-medium"}

      />
    </div>
  );
}
