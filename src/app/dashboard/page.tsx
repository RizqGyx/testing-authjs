import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { auth } from "@/lib/auth";

export default async function Page() {
  const session = await auth();

  return (
    <SidebarProvider>
      <AppSidebar user={session?.user}/>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    Building Your Application
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="bg-muted/50 aspect-video rounded-xl" />
            <div className="bg-muted/50 aspect-video rounded-xl" />
            <div className="bg-muted/50 aspect-video rounded-xl" />
            
            {/* Session Information Card */}
            <div className="md:col-span-3 bg-card border rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-4">Session Information</h2>
              {session?.user ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    {session.user.image && (
                      <img 
                        src={session.user.image} 
                        alt="Profile" 
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <h3 className="text-lg font-semibold">{session.user.name || 'No name'}</h3>
                      <p className="text-muted-foreground">{session.user.email}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">User ID</label>
                      <p className="font-mono text-sm bg-muted p-2 rounded">{session.user.id}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Role</label>
                      <p className="font-medium capitalize bg-primary/10 text-primary p-2 rounded">{session.user.role}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Profile Image</label>
                      <p className="text-sm text-muted-foreground">
                        {session.user.image ? 'Available' : 'Not set'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Raw session data for debugging */}
                  <details className="mt-6">
                    <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                      Raw Session Data
                    </summary>
                    <pre className="mt-2 text-xs bg-muted p-4 rounded overflow-auto">
                      {JSON.stringify(session, (key, value) => value === undefined ? null : value, 2)}
                    </pre>
                  </details>
                </div>
              ) : (
                <p className="text-muted-foreground">No session data available</p>
              )}
            </div>
          </div>
          <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
