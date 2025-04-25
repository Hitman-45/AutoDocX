import React, { useEffect, useState } from 'react';
import Layout from '@theme/Layout';

export default function Visualization() {
  const [iframeKey, setIframeKey] = useState(0);

  // Force iframe reload on component mount to fix loading issue in SPA routing
  useEffect(() => {
    setIframeKey((prev) => prev + 1);
  }, []);

  return (
    <Layout title="Visualization" description="Interactive data visualization">
      <div style={{ width: '100%', height: 'calc(100vh - 64px)' }}>
        <iframe
          key={iframeKey}
          src="/Visualization/index.html"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
          }}
          title="Visualization"
        />
      </div>
    </Layout>
  );
}