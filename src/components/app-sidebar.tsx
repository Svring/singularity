import { ChevronDown, Settings, Moon, Sun, Eye, SquareMousePointer, Gauge } from "lucide-react"
import { Link } from "react-router-dom"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

import { Button } from "@/components/ui/button"

import { useTheme } from "@/components/theme-provider"
import { useServiceStore } from "@/store/service/serviceStore"
import { useEffect } from "react"



// Menu items.
const items = [
  {
    title: "Dock",
    url: "/dock",
    icon: Gauge,
  },
  {
    title: "Omniparser",
    url: "/omniparser",
    icon: Eye,
  },
  {
    title: "Operator",
    url: "/operator",
    icon: SquareMousePointer,
  },
]

export function AppSidebar() {
  const { theme, setTheme } = useTheme();

  const loadServiceConfig = useServiceStore(state => state.loadServiceConfig);
  const services = useServiceStore(state => state.services);

  useEffect(() => {
    loadServiceConfig();
  }, [loadServiceConfig]);

  console.log(services);

  return (
    <Sidebar variant="floating">

      <SidebarHeader>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton>
              Select LLM
              <ChevronDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[--radix-popper-anchor-width]">
            <DropdownMenuItem>
              <span>Claude-3-7</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <span>GPT-4o</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarHeader>

      <SidebarContent>
        <Collapsible defaultOpen className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger>
                Tools
                <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <Link to={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      </SidebarContent>

      <SidebarFooter>
        <div className="flex flex-row justify-between w-full">
          <Button variant="ghost">
            <Settings />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
