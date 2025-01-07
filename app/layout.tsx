import { SidebarProvider } from "@/components/ui/sidebar"
import { MainNav } from "@/components/main-nav"
import dynamic from 'next/dynamic'

const ThreeCanvas = dynamic(() => import('@/components/three-canvas').then((mod) => mod.ThreeCanvas), {
  ssr: false,
  loading: () => <div className="fixed inset-0 -z-10 bg-black" />
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body>
        <SidebarProvider>
          <div className="flex h-screen">
            <MainNav />
            <main className="flex-1 overflow-hidden">
              <div className="relative h-screen">
                <ThreeCanvas className="fixed inset-0 -z-10" />
                <div className="relative z-10 h-full overflow-auto">
                  {children}
                </div>
              </div>
            </main>
          </div>
        </SidebarProvider>
      </body>
    </html>
  )
}

