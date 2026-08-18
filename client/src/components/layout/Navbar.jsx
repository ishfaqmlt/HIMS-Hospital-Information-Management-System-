"use client";

import { LogOut, Moon, Settings, Sun, User } from "lucide-react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { logoutUser } from "@/reduxToolKit/slices/authSlice";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { useTheme } from "next-themes";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Heart } from "lucide-react";
export default function Navbar() {
const {theme, setTheme} = useTheme();
const dispatch = useDispatch();
const router = useRouter();
const { user } = useSelector((state) => state.auth);

const handleLogout = async () => {
  await dispatch(logoutUser());
  router.push("/login");
};

    return (
       <nav className="w-full h-16 border-b flex items-center px-4 justify-between bg-background">
{/* left */}
<Link href="/Modules/Dashboard" className="flex items-center gap-2">
  <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
    <Heart className="h-5 w-5 text-primary-foreground" />
  </div>
  <span className="font-bold text-lg">HIMS</span>
</Link>
{/* right */}
<div className="flex items-center gap-4">
<Link href="/Modules/Dashboard" className="text-sm font-medium hover:underline">Dashboard</Link>
{/* Theme Menu  */}
 <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

{/* User Menu  */}
<DropdownMenu>
  <DropdownMenuTrigger>
    <div className="flex items-center gap-2 cursor-pointer">
      <Avatar>
        <AvatarImage src="" alt="" />
        <AvatarFallback>{user?.name?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
      </Avatar>
      <span className="text-sm font-medium hidden sm:inline">{user?.name || "User"}</span>
    </div>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>My Account</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>
      <User className="h-[1.2rem] w-[1.2rem] mr-2" />Profile
      </DropdownMenuItem>
    <DropdownMenuItem>
      <Settings className="h-[1.2rem] w-[1.2rem] mr-2" />Settings
      </DropdownMenuItem>
    <DropdownMenuItem onClick={handleLogout}>
      <LogOut className="h-[1.2rem] w-[1.2rem] mr-2" />Logout
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
</div>
       </nav>
    );
}