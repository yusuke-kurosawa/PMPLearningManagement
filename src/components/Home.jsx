import React from 'react';
import { Link } from 'react-router-dom';
import { Grid, Network, Layers, ArrowRight } from 'lucide-react';

const Home = () => {
  const features = [
    {
      title: 'PMBOK Matrix View',
      description: 'Interactive matrix showing all 49 PMBOK processes organized by knowledge areas and process groups. Features search, filtering, and detailed ITTO information.',
      icon: Grid,
      link: '/matrix',
      color: 'bg-blue-500'
    },
    {
      title: 'Network Diagram',
      description: 'Force-directed graph visualization of ITTO relationships. Explore connections between processes, inputs, tools, and outputs with interactive filtering.',
      icon: Network,
      link: '/network',
      color: 'bg-green-500'
    },
    {
      title: 'Integrated View',
      description: 'Split-screen view combining both matrix and network visualizations. Adjustable layout with fullscreen options for comprehensive analysis.',
      icon: Layers,
      link: '/integrated',
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            PMBOK 6th Edition Learning Management System
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore and understand the Project Management Body of Knowledge (PMBOK) through interactive visualizations of processes, inputs, tools & techniques, and outputs.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link
                key={feature.link}
                to={feature.link}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
              >
                <div className="p-6">
                  <div className={`${feature.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600 mb-4">{feature.description}</p>
                  <div className="flex items-center text-blue-600 font-medium">
                    <span>Explore</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold mb-6 text-center">PMBOK 6th Edition Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">49</div>
              <div className="text-gray-600">Processes</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">10</div>
              <div className="text-gray-600">Knowledge Areas</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">5</div>
              <div className="text-gray-600">Process Groups</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-amber-600">ITTO</div>
              <div className="text-gray-600">Framework</div>
            </div>
          </div>
        </div>

        {/* Learning Tips */}
        <div className="mt-12 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-3">Learning Tips</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Use the Matrix View to understand the overall structure of PMBOK processes</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Explore the Network Diagram to visualize relationships between inputs, tools, and outputs</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>The Integrated View allows you to see both perspectives simultaneously for deeper understanding</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Click on processes to see detailed ITTO information and understand dependencies</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Home;