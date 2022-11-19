import AppstoreInstall from "@components/appstoreInstall";

import type { NextPage } from "next";
import Image from "next/image";

const Home: NextPage = () => {
  return (
    <div className="flex ">
      <AppstoreInstall />
    </div>
  );
};

export default Home;
