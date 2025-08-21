import React from "react";
import { Link } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Search, MessageSquare, Zap, Shield, Code, RefreshCw, Image } from "lucide-react";

const Navigation: React.FC = () => {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <Link to="/search">
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              <Search className="mr-2 h-4 w-4" />
              Search
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <Link to="/chat">
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Chat
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger>
            <Zap className="mr-2 h-4 w-4" />
            Tools
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid gap-3 p-6 w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              <div className="row-span-3">
                <NavigationMenuLink asChild>
                  <Link
                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                    to="/vault"
                  >
                    <Shield className="h-6 w-6" />
                    <div className="mb-2 mt-4 text-lg font-medium">
                      Prism Vault
                    </div>
                    <p className="text-sm leading-tight text-muted-foreground">
                      Secure password management with advanced encryption
                    </p>
                  </Link>
                </NavigationMenuLink>
              </div>
              <Link to="/code" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                <div className="text-sm font-medium leading-none flex items-center">
                  <Code className="mr-2 h-4 w-4" />
                  Prism Code
                </div>
                <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                  AI-powered development environment
                </p>
              </Link>
              <Link to="/image-gen" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                <div className="text-sm font-medium leading-none flex items-center">
                  <Image className="mr-2 h-4 w-4" />
                  Image Generator
                </div>
                <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                  AI-powered image generation with Google Imagen
                </p>
              </Link>
              <Link to="/conversions" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                <div className="text-sm font-medium leading-none flex items-center">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Conversions
                </div>
                <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                  File format conversion tools
                </p>
              </Link>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <Link to="/pricing">
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Pricing
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default Navigation;
