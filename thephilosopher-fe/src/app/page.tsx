import Image from 'next/image'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-18">
      <div className="relative flex place-items-center before:absolute z-[-1]">
        <Image
          className="relative"
          src="/the_philosopher_logo.png"
          alt="The Philosopher"
          width={250}
          height={250}
          priority
        />
      </div>
    </main>
  )
}
