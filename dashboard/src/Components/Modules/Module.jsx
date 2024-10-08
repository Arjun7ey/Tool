import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { Search, Globe, Package, ArrowRight, ArrowLeft } from 'lucide-react';

const DomainPermissions = () => {
  const [domains, setDomains] = useState([]);
  const [modules, setModules] = useState([]);
  const [expandedDomain, setExpandedDomain] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDomains();
    fetchModules();
  }, []);

  const fetchDomains = async () => {
    try {
      const response = await axiosInstance.get('/api/emaildomainpermissions/');
      setDomains(response.data);
    } catch (error) {
      console.error('Error fetching domains:', error);
    }
  };

  const fetchModules = async () => {
    try {
      const response = await axiosInstance.get('/api/modules/');
      setModules(response.data);
    } catch (error) {
      console.error('Error fetching modules:', error);
    }
  };

  const handleAddModule = async (domain, moduleId) => {
    try {
      await axiosInstance.post('/api/add-module/', {
        domain: domain,
        module: moduleId
      });
      fetchDomains();
    } catch (error) {
      console.error('Error adding module:', error);
    }
  };

  const handleRemoveModule = async (domain, moduleId) => {
    try {
      await axiosInstance.post('/api/remove-module/', {
        domain: domain,
        module: moduleId
      });
      fetchDomains();
    } catch (error) {
      console.error('Error removing module:', error);
    }
  };

  const toggleDomain = (domainId) => {
    setExpandedDomain(expandedDomain === domainId ? null : domainId);
  };

  const filteredDomains = domains.filter(domain =>
    domain.domain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-10 text-black">
          Domain <span className="text-gold">Module</span> Management
        </h1>
        
        <div className="mb-8 relative">
          <input
            type="text"
            placeholder="Search domains..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:border-gold focus:outline-none transition duration-300"
          />
          <Search className="absolute left-4 top-3.5 text-gray-400" size={24} />
        </div>

        <div className="space-y-8">
          {filteredDomains.map(domain => (
            <div key={domain.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
              <div 
                className="flex items-center justify-between p-4 cursor-pointer bg-gray-50 border-b border-gray-200"
                onClick={() => toggleDomain(domain.id)}
              >
                <div className="flex items-center">
                  <Globe className="text-gold mr-3" size={24} />
                  <span className="font-medium text-lg text-black">{domain.domain}</span>
                </div>
                <Package className="text-gold" size={24} />
              </div>
              {expandedDomain === domain.id && (
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h3 className="font-semibold mb-4 text-lg text-black flex items-center">
                      <Package className="text-gold mr-2" size={20} />
                      Active Package
                    </h3>
                    <div className="space-y-2">
                      {domain.allowed_modules.map(module => (
                        <div key={module.id} className="flex items-center justify-between bg-white p-3 rounded-md shadow-sm">
                          <span className="text-sm text-gray-800">{module.name}</span>
                          <button
                            onClick={() => handleRemoveModule(domain.domain, module.id)}
                            className="text-gold hover:text-yellow-600 transition duration-300"
                            title="Remove from package"
                          >
                            <ArrowRight size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h3 className="font-semibold mb-4 text-lg text-black">Available Modules</h3>
                    <div className="space-y-2">
                      {modules.filter(m => !domain.allowed_modules.some(am => am.id === m.id)).map(module => (
                        <div key={module.id} className="flex items-center justify-between bg-white p-3 rounded-md shadow-sm">
                          <span className="text-sm text-gray-800">{module.name}</span>
                          <button
                            onClick={() => handleAddModule(domain.domain, module.id)}
                            className="text-gold hover:text-yellow-600 transition duration-300"
                            title="Add to package"
                          >
                            <ArrowLeft size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DomainPermissions;