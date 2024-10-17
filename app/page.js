'use client';

import { useState, useEffect, useRef } from 'react';
import Image from "next/image";

const extractMovieName = (url) => {
  const match = url.match(/\.beer\/(.*?)(?:\/|$)/);
  return match ? decodeURIComponent(match[1].replace(/-/g, ' ')) : 'Unknown Movie';
};

export default function Home() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCards, setExpandedCards] = useState({});
  const [headerOpacity, setHeaderOpacity] = useState(0);
  const headerRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/getdata');
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError('Failed to load data');
      }
    };

    fetchData();

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const newOpacity = Math.min(scrollPosition / (windowHeight * 0.3), 1);
      setHeaderOpacity(newOpacity);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const validDownloadLinks = data?.filter(item => 
    item.downloadLinks.some(link => link.subLinks.length > 0)
  );

  const uniqueMovies = validDownloadLinks?.reduce((acc, current) => {
    const movieName = extractMovieName(current.url);
    const x = acc.find(item => extractMovieName(item.url) === movieName);
    if (!x) {
      return acc.concat([current]);
    } else {
      return acc;
    }
  }, []);

  const filteredMovies = uniqueMovies?.filter(item => 
    extractMovieName(item.url).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleCardExpansion = (index) => {
    setExpandedCards(prev => ({...prev, [index]: !prev[index]}));
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <header ref={headerRef} className="p-4 fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out" style={{ backgroundColor: `rgba(17, 17, 17, ${headerOpacity})` }}>
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">MARMIK&apos;s Movie Hub</h1>
          <div className="relative">
            <input 
              type="text"
              placeholder="Search for movies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-full bg-[#222] border border-[#333] text-white focus:outline-none focus:ring-2 focus:ring-[#666] transition-all duration-300 ease-in-out"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#666]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-24 pb-16">
        <pre className="text-center text-xs sm:text-sm md:text-base lg:text-lg font-mono mb-8 text-white font-bold">
{`
███╗   ███╗ █████╗ ██████╗ ███╗   ███╗██╗██╗  ██╗
████╗ ████║██╔══██╗██╔══██╗████╗ ████║██║██║ ██╔╝
██╔████╔██║███████║██████╔╝██╔████╔██║██║█████╔╝ 
██║╚██╔╝██║██╔══██║██╔══██╗██║╚██╔╝██║██║██╔═██╗ 
██║ ╚═╝ ██║██║  ██║██║  ██║██║ ╚═╝ ██║██║██║  ██╗
╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝╚═╝  ╚═╝
`}
        </pre>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        
        {filteredMovies && filteredMovies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredMovies.map((item, index) => (
              <div key={index} className="bg-[#222] rounded-lg overflow-hidden transition-transform duration-300 hover:scale-105 shadow-lg">
                <div className="relative">
                  <Image
                    src={item.imgSrc}
                    alt={extractMovieName(item.url)}
                    width={300}
                    height={450}
                    layout="responsive"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <h2 className="text-white font-bold text-lg">{extractMovieName(item.url)}</h2>
                  </div>
                </div>
                <div className="p-4">
                  <button 
                    className="w-full py-2 px-4 bg-[#333] text-white rounded-md hover:bg-[#444] transition-colors duration-300 flex justify-between items-center"
                    onClick={() => toggleCardExpansion(index)}
                  >
                    <span>{expandedCards[index] ? 'Hide' : 'Show'} Links</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-300 ${expandedCards[index] ? 'transform rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {expandedCards[index] && (
                    <div className="mt-4 max-h-40 overflow-y-auto custom-scrollbar">
                      {item.downloadLinks.map((link, linkIndex) => (
                        link.subLinks.length > 0 && (
                          <div key={linkIndex} className="mb-2">
                            <h3 className="font-semibold text-sm text-[#888] mb-1">Option {linkIndex + 1}</h3>
                            <ul className="space-y-1">
                              {link.subLinks.map((subLink, subIndex) => (
                                <li key={subIndex}>
                                  <a
                                    href={subLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#0070f3] hover:text-[#3291ff] text-sm transition-colors duration-300"
                                  >
                                    Download {subIndex + 1}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-[#888]">No valid download links available.</p>
        )}
      </main>

      <footer className="mt-8 p-4 bg-[#111] text-center text-[#888]">
        <p>&copy; 2024 MARMIK&apos;s Movie Hub. All rights reserved.</p>
        <p className="mt-2">For web, Android, iOS, and cybersecurity tasks, contact: <a href="mailto:paraboyyy1704@gmail.com" className="text-[#0070f3] hover:underline transition-colors duration-300">paraboyyy1704@gmail.com</a></p>
      </footer>

      <style jsx global>{`
        /* Custom scrollbar styles */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #333;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #666;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #888;
        }

        /* For Firefox */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #666 #333;
        }

        /* Smooth scrolling for the whole page */
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
}
