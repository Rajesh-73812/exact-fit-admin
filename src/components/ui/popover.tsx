import { Popover } from "@headlessui/react";
import { Fragment } from "react";
import { ChevronDownIcon } from "@heroicons/react/16/solid";

// A simple Popover component to display a dropdown
export const PopoverMenu = () => (
  <Popover className="relative">
    <Popover.Button className="inline-flex items-center gap-2 bg-[#8000FF] text-white px-4 py-2 rounded-md focus:outline-none">
      <span>Filters</span>
      <ChevronDownIcon className="w-4 h-4" />
    </Popover.Button>
    <Popover.Panel className="absolute right-0 mt-2 w-52 origin-top-right bg-white border border-gray-200 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
      <div className="py-1">
        <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none">
          Filter 1
        </button>
        <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none">
          Filter 2
        </button>
        <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none">
          Filter 3
        </button>
      </div>
    </Popover.Panel>
  </Popover>
);
