import { Loader2 } from "lucide-react";

export default function Loader() {
  return (
    <div className="w-full h-screen flex justify-center items-center">
      <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
    </div>
  );
}
