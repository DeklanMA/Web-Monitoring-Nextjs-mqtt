'use client'
import { Navbar } from '@/components/Navbar';
import React from 'react';



export default function Layout({ children }) {

    return (
        <div className="flex h-screen bg-gray-100">
            <div className='flex flex-col flex-1 ml-auto '>
                <Navbar />
                <div className="h-full overflow-y-auto no-scrollbar">
                    {children}
                </div>
            </div>
        </div>
    );
}