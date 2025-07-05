import React, { useState, useMemo, useCallback, memo } from 'react';
import { ChevronDown, ChevronRight, Search, X, Loader2 } from 'lucide-react';

const PMBOKMatrix = memo(() => {
  const [loading, setLoading] = useState(false);
  const [expandedAreas, setExpandedAreas] = useState(new Set());
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const processGroups = [
    'Initiating',
    'Planning',
    'Executing',
    'Monitoring & Controlling',
    'Closing'
  ];

  const knowledgeAreas = [
    { id: 'integration', name: 'Project Integration Management', processes: 7 },
    { id: 'scope', name: 'Project Scope Management', processes: 6 },
    { id: 'schedule', name: 'Project Schedule Management', processes: 6 },
    { id: 'cost', name: 'Project Cost Management', processes: 4 },
    { id: 'quality', name: 'Project Quality Management', processes: 3 },
    { id: 'resource', name: 'Project Resource Management', processes: 6 },
    { id: 'communications', name: 'Project Communications Management', processes: 3 },
    { id: 'risk', name: 'Project Risk Management', processes: 7 },
    { id: 'procurement', name: 'Project Procurement Management', processes: 3 },
    { id: 'stakeholder', name: 'Project Stakeholder Management', processes: 4 }
  ];

  const processes = {
    integration: {
      'Initiating': ['Develop Project Charter'],
      'Planning': ['Develop Project Management Plan'],
      'Executing': ['Direct and Manage Project Work', 'Manage Project Knowledge'],
      'Monitoring & Controlling': ['Monitor and Control Project Work', 'Perform Integrated Change Control'],
      'Closing': ['Close Project or Phase']
    },
    scope: {
      'Planning': ['Plan Scope Management', 'Collect Requirements', 'Define Scope', 'Create WBS'],
      'Monitoring & Controlling': ['Validate Scope', 'Control Scope']
    },
    schedule: {
      'Planning': ['Plan Schedule Management', 'Define Activities', 'Sequence Activities', 'Estimate Activity Durations', 'Develop Schedule'],
      'Monitoring & Controlling': ['Control Schedule']
    },
    cost: {
      'Planning': ['Plan Cost Management', 'Estimate Costs', 'Determine Budget'],
      'Monitoring & Controlling': ['Control Costs']
    },
    quality: {
      'Planning': ['Plan Quality Management'],
      'Executing': ['Manage Quality'],
      'Monitoring & Controlling': ['Control Quality']
    },
    resource: {
      'Planning': ['Plan Resource Management', 'Estimate Activity Resources'],
      'Executing': ['Acquire Resources', 'Develop Team', 'Manage Team'],
      'Monitoring & Controlling': ['Control Resources']
    },
    communications: {
      'Planning': ['Plan Communications Management'],
      'Executing': ['Manage Communications'],
      'Monitoring & Controlling': ['Monitor Communications']
    },
    risk: {
      'Planning': ['Plan Risk Management', 'Identify Risks', 'Perform Qualitative Risk Analysis', 'Perform Quantitative Risk Analysis', 'Plan Risk Responses'],
      'Executing': ['Implement Risk Responses'],
      'Monitoring & Controlling': ['Monitor Risks']
    },
    procurement: {
      'Planning': ['Plan Procurement Management'],
      'Executing': ['Conduct Procurements'],
      'Monitoring & Controlling': ['Control Procurements']
    },
    stakeholder: {
      'Initiating': ['Identify Stakeholders'],
      'Planning': ['Plan Stakeholder Engagement'],
      'Executing': ['Manage Stakeholder Engagement'],
      'Monitoring & Controlling': ['Monitor Stakeholder Engagement']
    }
  };

  const processDetails = {
    'Develop Project Charter': {
      inputs: ['Business documents', 'Agreements', 'Enterprise environmental factors', 'Organizational process assets'],
      tools: ['Expert judgment', 'Data gathering', 'Interpersonal and team skills', 'Meetings'],
      outputs: ['Project charter', 'Assumption log']
    },
    'Develop Project Management Plan': {
      inputs: ['Project charter', 'Outputs from other processes', 'Enterprise environmental factors', 'Organizational process assets'],
      tools: ['Expert judgment', 'Data gathering', 'Interpersonal and team skills', 'Meetings'],
      outputs: ['Project management plan']
    },
    'Direct and Manage Project Work': {
      inputs: ['Project management plan', 'Project documents', 'Approved change requests', 'Enterprise environmental factors', 'Organizational process assets'],
      tools: ['Expert judgment', 'Project management information system', 'Meetings'],
      outputs: ['Deliverables', 'Work performance data', 'Issue log', 'Change requests', 'Project management plan updates', 'Project documents updates', 'Organizational process assets updates']
    },
    'Manage Project Knowledge': {
      inputs: ['Project management plan', 'Project documents', 'Deliverables', 'Enterprise environmental factors', 'Organizational process assets'],
      tools: ['Expert judgment', 'Knowledge management', 'Information management', 'Interpersonal and team skills'],
      outputs: ['Lessons learned register', 'Project management plan updates', 'Organizational process assets updates']
    },
    'Monitor and Control Project Work': {
      inputs: ['Project management plan', 'Project documents', 'Work performance information', 'Agreements', 'Enterprise environmental factors', 'Organizational process assets'],
      tools: ['Expert judgment', 'Data analysis', 'Decision making', 'Meetings'],
      outputs: ['Work performance reports', 'Change requests', 'Project management plan updates', 'Project documents updates']
    },
    'Perform Integrated Change Control': {
      inputs: ['Project management plan', 'Project documents', 'Work performance reports', 'Change requests', 'Enterprise environmental factors', 'Organizational process assets'],
      tools: ['Expert judgment', 'Change control tools', 'Data analysis', 'Decision making', 'Meetings'],
      outputs: ['Approved change requests', 'Project management plan updates', 'Project documents updates']
    },
    'Close Project or Phase': {
      inputs: ['Project charter', 'Project management plan', 'Project documents', 'Accepted deliverables', 'Business documents', 'Agreements', 'Procurement documentation', 'Organizational process assets'],
      tools: ['Expert judgment', 'Data analysis', 'Meetings'],
      outputs: ['Project documents updates', 'Final product, service, or result transition', 'Final report', 'Organizational process assets updates']
    }
  };

  const toggleArea = useCallback((areaId) => {
    setLoading(true);
    setTimeout(() => {
      const newExpanded = new Set(expandedAreas);
      if (newExpanded.has(areaId)) {
        newExpanded.delete(areaId);
      } else {
        newExpanded.add(areaId);
      }
      setExpandedAreas(newExpanded);
      setLoading(false);
    }, 100);
  }, [expandedAreas]);

  const handleProcessClick = useCallback((process) => {
    setLoading(true);
    setTimeout(() => {
      setSelectedProcess(process);
      setLoading(false);
    }, 100);
  }, []);

  const filteredProcesses = useMemo(() => {
    if (!searchQuery) return processes;
    
    const filtered = {};
    const query = searchQuery.toLowerCase();
    
    Object.entries(processes).forEach(([area, groups]) => {
      const filteredGroups = {};
      Object.entries(groups).forEach(([group, processList]) => {
        const filteredList = processList.filter(process => 
          process.toLowerCase().includes(query)
        );
        if (filteredList.length > 0) {
          filteredGroups[group] = filteredList;
        }
      });
      if (Object.keys(filteredGroups).length > 0) {
        filtered[area] = filteredGroups;
      }
    });
    
    return filtered;
  }, [searchQuery]);

  const getProcessCount = (areaId) => {
    const areaProcesses = filteredProcesses[areaId];
    if (!areaProcesses) return 0;
    return Object.values(areaProcesses).reduce((sum, group) => sum + group.length, 0);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-2 sm:p-4 md:p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 sm:p-6 border-b">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">
            PMBOK 6th Edition - Process Matrix (49 Processes)
          </h1>
          
          <div className="relative">
            <input
              type="text"
              placeholder="Search processes..."
              className="w-full px-3 sm:px-4 py-2 pl-9 sm:pl-10 pr-10 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-2.5 sm:left-3 top-2.5 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 sm:right-3 top-2.5 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full min-w-[640px]">
            <thead className="bg-gray-50 border-b sticky top-0 z-10">
              <tr>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Knowledge Area
                </th>
                {processGroups.map(group => (
                  <th key={group} className="px-3 sm:px-6 py-2 sm:py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    <span className="hidden sm:inline">{group}</span>
                    <span className="sm:hidden">{group.split(' ')[0]}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {knowledgeAreas.map(area => {
                const isExpanded = expandedAreas.has(area.id);
                const processCount = getProcessCount(area.id);
                const hasFilteredProcesses = processCount > 0;

                if (!hasFilteredProcesses && searchQuery) return null;

                return (
                  <React.Fragment key={area.id}>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <button
                          onClick={() => toggleArea(area.id)}
                          className="flex items-center space-x-1 sm:space-x-2 text-left w-full"
                          disabled={loading}
                        >
                          {loading ? (
                            <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 animate-spin" />
                          ) : isExpanded ? (
                            <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                          ) : (
                            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                          )}
                          <span className="font-medium text-gray-900 text-sm sm:text-base break-words">
                            <span className="hidden sm:inline">{area.name}</span>
                            <span className="sm:hidden">{area.name.replace(' Management', '')}</span>
                          </span>
                          <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">({processCount})</span>
                        </button>
                      </td>
                      {processGroups.map(group => {
                        const groupProcesses = filteredProcesses[area.id]?.[group] || [];
                        return (
                          <td key={group} className="px-3 sm:px-6 py-3 sm:py-4 text-center">
                            {groupProcesses.length > 0 && (
                              <span className="inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-blue-100 text-blue-800 text-xs sm:text-sm font-semibold">
                                {groupProcesses.length}
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                    {isExpanded && filteredProcesses[area.id] && (
                      <tr>
                        <td colSpan={6} className="px-3 sm:px-6 py-3 sm:py-4 bg-gray-50">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                            {processGroups.map(group => {
                              const groupProcesses = filteredProcesses[area.id][group];
                              if (!groupProcesses || groupProcesses.length === 0) return null;
                              
                              return (
                                <div key={group} className="space-y-1.5 sm:space-y-2">
                                  <h4 className="font-semibold text-gray-700 text-xs sm:text-sm sticky top-0 bg-gray-50 py-1">
                                    {group}
                                  </h4>
                                  {groupProcesses.map(process => (
                                    <button
                                      key={process}
                                      onClick={() => handleProcessClick(process)}
                                      disabled={loading}
                                      className="block w-full text-left px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-white rounded border hover:bg-blue-50 hover:border-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      {process}
                                    </button>
                                  ))}
                                </div>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedProcess && processDetails[selectedProcess] && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] sm:max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-4 sm:p-6 border-b flex justify-between items-start">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 pr-4">{selectedProcess}</h2>
              <button
                onClick={() => setSelectedProcess(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6">
              <div className="space-y-4 sm:space-y-6">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
                  </div>
                ) : (
                  <>
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">Inputs</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {processDetails[selectedProcess].inputs.map((input, idx) => (
                          <li key={idx} className="text-gray-600 text-sm sm:text-base ml-2">{input}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">Tools & Techniques</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {processDetails[selectedProcess].tools.map((tool, idx) => (
                          <li key={idx} className="text-gray-600 text-sm sm:text-base ml-2">{tool}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">Outputs</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {processDetails[selectedProcess].outputs.map((output, idx) => (
                          <li key={idx} className="text-gray-600 text-sm sm:text-base ml-2">{output}</li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

PMBOKMatrix.displayName = 'PMBOKMatrix';

export default PMBOKMatrix;