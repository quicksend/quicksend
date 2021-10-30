import Image from "next/image";

export const Index = () => {
  return (
    <div className="bg-river-900 h-screen w-screen">
      <header className="flex justify-center p-5">
        <Image alt="Quicksend" src="/quicksend.svg" height={100} width={320} />
      </header>
    </div>
  );
};

export default Index;
