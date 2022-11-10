import type { NextPage } from "next";
import { useEffect } from "react";
import { useRouter } from "next/router";
import AppstoreInstall from "@components/appstoreInstall";

const Share: NextPage = () => {
  const router = useRouter();
  const { route, params } = router.query;

  useEffect(() => {
    if (true || (route && params)) {
      document.location = `myapp://${route}/${params}`;
    }
  }, [route, params]);

  return (
    <div className="flex h-96 flex-row items-center justify-center">
      <button
        className=" p-1 hover:scale-95 rounded"
        onClick={() => {
          document.location = "https://apps.apple.com/app/id6444195961";
        }}
      >
        <p className="text-xl bg-blue-300 rounded-3xl text-white p-2">
          Install College Table in Appstore
        </p>
      </button>
    </div>
  );
};

export default Share;
