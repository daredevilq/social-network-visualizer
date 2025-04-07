'use client'
import {useState} from 'react'

export default function RightSidebar() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            {/* Ikona w prawym górnym rogu */}
            <div className="fixed top-4 right-4 z-50">
                <button
                    onClick={() => setIsOpen(true)}
                    className="p-2 text-white bg-blue-600 rounded-full shadow-md"
                >
                    <span>RIGHT-SIDEBAR</span>
                </button>
            </div>

            {/* Sidebar z prawej */}
            <div
                className={`fixed top-0 right-0 h-full w-[30vw] max-w-sm shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                } rounded-l-xl`}
                style={{backgroundColor: '#262631'}}
            >
                {/* Zbiorczy padding tutaj */}
                <div className="p-10 h-full flex flex-col overflow-y-auto text-white space-y-10">
                    {/* Nagłówek */}
                    <div className="flex items-center justify-between border-b border-gray-600 pb-4">
                        <h1 className="text-2xl font-bold">Kamilek Rudny</h1>
                        <div className="fixed top-4 right-4 z-50">
                            <button onClick={() => setIsOpen(false)} className="p-2 text-white bg-blue-600 rounded-full shadow-md">
                                <span>RIGHT-SIDEBAR</span>
                            </button>
                        </div>
                    </div>

                    {/* ID użytkownika */}
                    <div>
                        <p className="text-sm text-gray-400">#user117</p>
                    </div>

                    {/* Szczegóły użytkownika */}
                    <div>
                        <h3 className="text-lg font-semibold mb-2">User Details:</h3>
                        <hr className="border-gray-500 mb-4"/>
                        <ul className="space-y-2 text-sm">
                            <li><span className="font-semibold">Date of birth:</span> 07.03.2003</li>
                            <li><span className="font-semibold">Date of account creation:</span> 05.02.2022</li>
                            <li><span className="font-semibold">Followers:</span> 115</li>
                            <li><span className="font-semibold">Following:</span> 12</li>
                        </ul>
                    </div>

                    {/* Aktywność użytkownika */}
                    <div>
                        <h3 className="text-lg font-semibold mb-2">User activity:</h3>
                        <hr className="border-gray-500 mb-4"/>
                        <ul className="space-y-2 text-sm">
                            <li><span className="font-semibold">Posts:</span> 7</li>
                            <li><span className="font-semibold">Likes:</span> 6</li>
                            <li><span className="font-semibold">Comments:</span> 6</li>
                            <li><span className="font-semibold">Shares:</span> 3</li>
                            <li><span className="font-semibold">Retweets:</span> 3</li>
                        </ul>
                    </div>
                </div>
            </div>
        </>
    )
}
