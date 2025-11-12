import { Tag, Users, Settings, Bookmark, SquarePen, LayoutGrid, LucideIcon, BookmarkMinus, Box, Image,UserCog  } from "lucide-react";

type Submenu = {
  href: string;
  label: string;
  active?: boolean;
};

type Menu = {
  href: string;
  label: string;
  active?: boolean;
  icon: LucideIcon;
  submenus?: Submenu[];
};

type Group = {
  groupLabel: string;
  menus: Menu[];
};

export function getMenuList(pathname: string): Group[] {
  return [
    {
      groupLabel: "",
      menus: [
        {
          href: "/dashboard",
          label: "Dashboard",
          icon: LayoutGrid,
          submenus: []
        }
      ]
    },
    {
      groupLabel: "Catlog",
      menus: [
        {
          href: "/categories",
          label: "Services",
          icon: Bookmark
        },
        {

          href: "/subcategories",
          label: "Sub Services",
          icon: BookmarkMinus
        },
        // {
        //   href: "/products/list",
        //   label: "Services",
        //   icon: Box
        // },
        {
          href: "/banners/list",
          label: "Banners",
          icon: Image
        },   
        {
          href: "/technicians",
          label: "Technicians",
          icon: UserCog
        },  
        {
          href: "/customers",
          label: "Customers",
          icon: Users
        }   
      ]
    },
    {
      groupLabel:"Bookings",
      menus:[
        {
          href:"",
          label:"Bookings",
          icon:SquarePen,
          submenus:[
            {
              href:"/subscription",
              label:"Subscription"
            },
            {
              href:"/emergency",
              label:"Emergency",
            },
            {
              href:"enquiry",
              label:"Enquiry"
            }
          ]
        }
      ]
    },
    {
      groupLabel: "Reports",
      menus: [
        {
          href: "",
          label: "Reports",
          icon: SquarePen,
          submenus: [
            {
              href: "/posts",
              label: "Sales Reports"
            },
            {
              href: "/posts/new",
              label: "Payment Reports"
            },
            {
              href: "/posts/new",
              label: "User Reports"
            },
            {
              href: "/posts/new",
              label: "Technicain Reports"
            },
            {
              href: "/posts/new",
              label: "Booking Reports"
            }
          ]
        },
        {
          href: "/enquiry",
          label: "Enquiry",
          icon: Tag
        }
      ]
    },
    {
      groupLabel: "Settings",
      menus: [
        // {
        //   href: "/users",
        //   label: "Users",
        //   icon: Users
        // },
        {
          href: "/account",
          label: "Account",
          icon: Settings
        }
      ]
    }
  ];
}
