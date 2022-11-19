import AppstoreInstall from "@components/appstoreInstall";

import type { NextPage } from "next";

const Home: NextPage = () => {
  return (
    <div className="flex flex-row">
      <AppstoreInstall />
    </div>
  );
};

export default Home;
