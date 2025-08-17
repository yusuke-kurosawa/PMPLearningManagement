import React from 'react'

const SkipLinks: React.FC = () => {
  return (
    <div className='sr-only focus:not-sr-only'>
      <div className='fixed left-0 top-0 z-50 bg-blue-600 text-white'>
        <a
          href='#main-content'
          className='block px-4 py-2 text-sm font-medium transition-colors hover:bg-blue-700 focus:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600'
        >
          メインコンテンツへスキップ
        </a>
        <a
          href='#navigation'
          className='block px-4 py-2 text-sm font-medium transition-colors hover:bg-blue-700 focus:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600'
        >
          ナビゲーションへスキップ
        </a>
      </div>
    </div>
  )
}

export default SkipLinks
