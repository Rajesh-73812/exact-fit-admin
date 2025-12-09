import { Tag, Users, Settings, Bookmark, SquarePen, LayoutGrid, LucideIcon, BookmarkMinus, Box, Image,UserCog, IndianRupee, Bell, Contact, Building  } from "lucide-react";

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
          href: "/services",
          label: "Services",
          icon: Bookmark
        },
        {

          href: "/subservices",
          label: "Sub Services",
          icon: BookmarkMinus
        },
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
      groupLabel: "Business",
      menus: [
        {
          href: "/plans",
          label: "Plans",
          icon: IndianRupee
        },
        {
          href: "/property",
          label: "Property",
          icon: Building
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
              href:"/bookings/subscriptions",
              label:"Subscription"
            },
            {
              href:"/bookings/emergency",
              label:"Emergency",
            },
            {
              href:"/bookings/enquiry",
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
              href: "/reports/customers",
              label: "User Reports"
            },
            {
              href: "/reports/technicians",
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
      groupLabel: "Notifications",
      menus: [

        {
          href: "/notifications",
          label: "Notifications",
          icon: Bell
        },
        {
          href: "/contactus",
          label: "ContactUs",
          icon: Contact
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
