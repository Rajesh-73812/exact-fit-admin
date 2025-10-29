// components/ui/Loader.tsx
import React from 'react';
import Image from 'next/image';

const Loader = () => {
  return (
    <div
      className="col-span-full flex items-center justify-center min-h-[50vh]"
      data-testid="city-loader"
    >
      <div className="relative flex items-center justify-center">
        {/* Spinner arcs */}
        <div className="spinner-container">
          <div className="spinner-arc"></div>
          <div className="spinner-arc"></div>
          <div className="spinner-arc"></div>
          <div className="spinner-arc"></div>
        </div>

        {/* Center logo image */}
        <Image
          src="/Group.svg"
          width={48}
          height={48}
          alt="Loading"
          className="absolute w-12 h-12 object-contain"
        />
      </div>
    </div>
  );
};

export default Loader;


//* You can include this in your global styles (e.g. globals.css) */