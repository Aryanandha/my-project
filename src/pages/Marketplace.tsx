@@ .. @@
 import React, { useState, useEffect } from 'react';
 import { Link } from 'react-router-dom';
 import { useUser } from '../context/UserContext';
 import Header from '../components/Header';
 import { Search, MapPin, User, Heart, Eye, Filter } from 'lucide-react';
+import { useProfileSearch } from '../hooks/useProfiles';
+import type { Profile } from '../services/profileService';

-// Mock data for demo
-const mockProfiles = [
-  {
-    id: '1',
-    name: 'Rajesh Kumar Sharma',
-    role: 'Property 360',
-    serviceName: 'Premium Property Consultant & Dealer',
-    price: '₹8,000',
-    location: 'Mumbai, Maharashtra',
-    bio: 'Certified property consultant with 12+ years experience in Mumbai real estate. Specializing in luxury apartments, commercial spaces, and investment properties.',
-    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
-    phone: '+91 98765 43210',
-    email: 'rajesh.sharma@property360.com'
-  },
-  {
-    id: '2',
-    name: 'Arjun Patel',
-    role: 'Builder',
-    serviceName: 'Residential & Commercial Construction',
-    price: '₹2,50,000',
-    location: 'Ahmedabad, Gujarat',
-    bio: 'Licensed contractor with expertise in modern construction techniques. Completed 200+ residential projects and 50+ commercial buildings.',
-    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
-    phone: '+91 98765 43211',
-    email: 'arjun.patel@builders.com'
-  },
-  {
-    id: '3',
-    name: 'Advocate Meera Singh',
-    role: 'Advocate',
-    serviceName: 'Property Law & Legal Consultation',
-    price: '₹4,500',
-    location: 'Bangalore, Karnataka',
-    bio: 'Senior advocate specializing in property disputes, documentation, and real estate law. 15+ years of legal practice with 95% success rate.',
-    profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
-    phone: '+91 98765 43212',
-    email: 'meera.singh@lawfirm.com'
-  },
-  {
-    id: '4',
-    name: 'Suresh Yadav',
-    role: 'Landowner',
-    serviceName: 'Premium Land Sales & Development',
-    price: '₹75,000',
-    location: 'Pune, Maharashtra',
-    bio: 'Landowner with 500+ acres of prime agricultural and residential land. Offering plots for residential, commercial, and industrial development.',
-    profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
-    phone: '+91 98765 43213',
-    email: 'suresh.yadav@landdeals.com'
-  },
-  {
-    id: '5',
-    name: 'Kavita Joshi',
-    role: 'Society',
-    serviceName: 'Housing Society Management Services',
-    price: '₹12,000',
-    location: 'Mumbai, Maharashtra',
-    bio: 'Professional society manager handling 25+ housing societies. Expert in maintenance, legal compliance, and resident welfare management.',
-    profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
-    phone: '+91 98765 43214',
-    email: 'kavita.joshi@societycare.com'
-  },
-  {
-    id: '6',
-    name: 'Priya Sharma',
-    role: 'Interior',
-    serviceName: 'Luxury Interior Design & Decoration',
-    price: '₹18,000',
-    location: 'Delhi, NCR',
-    bio: 'Award-winning interior designer with expertise in residential and commercial spaces. Specialized in modern, contemporary, and traditional Indian designs.',
-    profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b332b6d0?w=150&h=150&fit=crop&crop=face',
-    phone: '+91 98765 43215',
-    email: 'priya.sharma@interiors.com'
-  },
-  {
-    id: '7',
-    name: 'Vikram Gupta',
-    role: 'Consulting',
-    serviceName: 'Real Estate Investment Consulting',
-    price: '₹15,000',
-    location: 'Gurgaon, Haryana',
-    bio: 'MBA in Finance with 10+ years in real estate consulting. Helping clients make informed property investment decisions with market analysis and ROI calculations.',
-    profileImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face',
-    phone: '+91 98765 43216',
-    email: 'vikram.gupta@reconsulting.com'
-  },
-  {
-    id: '8',
-    name: 'Dr. Ramesh Chandra',
-    role: 'Property 360',
-    serviceName: 'Property Valuation & Investment Advisory',
-    price: '₹10,000',
-    location: 'Hyderabad, Telangana',
-    bio: 'Certified property valuer and investment advisor. PhD in Real Estate Economics. Providing accurate property valuations and investment strategies.',
-    profileImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face',
-    phone: '+91 98765 43217',
-    email: 'dr.ramesh@propertyvaluation.com'
-  },
-  {
-    id: '9',
-    name: 'Sanjay Kumar',
-    role: 'Builder',
-    serviceName: 'Affordable Housing Construction',
-    price: '₹1,80,000',
-    location: 'Lucknow, Uttar Pradesh',
-    bio: 'Specialized in affordable housing projects under government schemes. Built 1000+ homes for middle-class families with quality construction at reasonable rates.',
-    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
-    phone: '+91 98765 43218',
-    email: 'sanjay.kumar@affordablebuilders.com'
-  },
-  {
-    id: '10',
-    name: 'Advocate Ravi Shankar',
-    role: 'Advocate',
-    serviceName: 'Property Documentation & Registration',
-    price: '₹6,000',
-    location: 'Chennai, Tamil Nadu',
-    bio: 'Expert in property documentation, title verification, and registration processes. Handled 2000+ property transactions with zero legal complications.',
-    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
-    phone: '+91 98765 43219',
-    email: 'ravi.shankar@propertylegal.com'
-  },
-  {
-    id: '11',
-    name: 'Geeta Devi',
-    role: 'Landowner',
-    serviceName: 'Farmland & Agricultural Plots',
-    price: '₹45,000',
-    location: 'Jaipur, Rajasthan',
-    bio: 'Third-generation landowner with 800+ acres of fertile farmland. Offering agricultural plots for farming, organic cultivation, and agri-business ventures.',
-    profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
-    phone: '+91 98765 43220',
-    email: 'geeta.devi@farmlands.com'
-  },
-  {
-    id: '12',
-    name: 'Amit Sharma',
-    role: 'Society',
-    serviceName: 'Cooperative Housing Society Setup',
-    price: '₹25,000',
-    location: 'Kolkata, West Bengal',
-    bio: 'Legal expert in cooperative housing society formation and management. Helped establish 100+ housing societies with complete legal compliance.',
-    profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
-    phone: '+91 98765 43221',
-    email: 'amit.sharma@cooperativesociety.com'
-  },
-  {
-    id: '13',
-    name: 'Neha Agarwal',
-    role: 'Interior',
-    serviceName: 'Modular Kitchen & Home Interiors',
-    price: '₹22,000',
-    location: 'Indore, Madhya Pradesh',
-    bio: 'Specialized in modular kitchens, wardrobes, and complete home interior solutions. 500+ satisfied customers with innovative space-saving designs.',
-    profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
-    phone: '+91 98765 43222',
-    email: 'neha.agarwal@modularinteriors.com'
-  },
-  {
-    id: '14',
-    name: 'Rohit Malhotra',
-    role: 'Consulting',
-    serviceName: 'Commercial Real Estate Advisory',
-    price: '₹20,000',
-    location: 'Noida, Uttar Pradesh',
-    bio: 'Commercial real estate specialist helping businesses find perfect office spaces, retail outlets, and warehouses. Expert in lease negotiations and space planning.',
-    profileImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face',
-    phone: '+91 98765 43223',
-    email: 'rohit.malhotra@commercialrealty.com'
-  },
-  {
-    id: '15',
-    name: 'Sunita Patel',
-    role: 'Property 360',
-    serviceName: 'Residential Property Sales & Rentals',
-    price: '₹7,500',
-    location: 'Surat, Gujarat',
-    bio: 'Full-service property consultant specializing in residential sales and rentals. Extensive database of verified properties with transparent pricing and documentation.',
-    profileImage: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face',
-    phone: '+91 98765 43224',
-    email: 'sunita.patel@residentialproperties.com'
-  }
-];
+const roles = ['All Services', 'Property 360', 'Builder', 'Advocate', 'Landowner', 'Society', 'Interior', 'Consulting'];

 const indianCities = [
@@ .. @@
   'Gwalior, Madhya Pradesh'
 ];

-const roles = ['All Services', 'Property 360', 'Builder', 'Advocate', 'Landowner', 'Society', 'Interior', 'Consulting'];
-
 const Marketplace: React.FC = () => {
   const { user, recentlyBrowsed, addToRecentlyBrowsed, addToShortlist, removeFromShortlist, isShortlisted } = useUser();
   const [searchParams] = new URLSearchParams(window.location.search);
   const [searchTerm, setSearchTerm] = useState('');
   const [selectedLocation, setSelectedLocation] = useState('');
   const [selectedRole, setSelectedRole] = useState('');
-  const [filteredProfiles, setFilteredProfiles] = useState(mockProfiles);
   const [showResults, setShowResults] = useState(false);
   const [locationError, setLocationError] = useState('');
+  
+  const { data: searchData, loading: searchLoading, error: searchError, searchProfiles } = useProfileSearch();

-  const roles = ['All Roles', 'Property 360', 'Builder', 'Advocate', 'Landowner', 'Society', 'Interior', 'Consulting'];
+  const roleOptions = ['All Roles', 'Property 360', 'Builder', 'Advocate', 'Landowner', 'Society', 'Interior', 'Consulting'];

   // Initialize search from URL parameters
@@ .. @@
     setSelectedRole(role === 'All Services' ? 'All Roles' : role);
   }, []);

-  useEffect(() => {
-    if (selectedLocation) {
-      setLocationError('');
-      let filtered = mockProfiles;
-
-      if (searchTerm) {
-        filtered = filtered.filter(profile => 
-          profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
-          profile.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
-          profile.role.toLowerCase().includes(searchTerm.toLowerCase())
-        );
-      }
-
-      if (selectedRole && selectedRole !== 'All Roles') {
-        filtered = filtered.filter(profile => profile.role === selectedRole);
-      }
-
-      if (selectedLocation !== 'All Locations') {
-        filtered = filtered.filter(profile => profile.location === selectedLocation);
-      }
-
-      setFilteredProfiles(filtered);
-      setShowResults(true);
-    } else {
-      setShowResults(false);
-    }
-  }, [searchTerm, selectedLocation, selectedRole]);
-
-  const handleSearch = () => {
+  const handleSearch = async () => {
     if (!selectedLocation) {
       setLocationError('Please select a location to search for services');
       return;
     }
     setLocationError('');
-    setShowResults(true);
+    
+    const filters = {
+      search: searchTerm || undefined,
+      location: selectedLocation === 'All Locations' ? undefined : selectedLocation,
+      role: selectedRole === 'All Roles' ? undefined : selectedRole,
+      limit: 20,
+      offset: 0
+    };
+    
+    await searchProfiles(filters);
+    setShowResults(true);
   };

-  const handleProfileClick = (profile: any) => {
+  const handleProfileClick = (profile: Profile) => {
     addToRecentlyBrowsed(profile);
   };

-  const handleShortlistToggle = (profile: any) => {
+  const handleShortlistToggle = (profile: Profile) => {
     if (isShortlisted(profile.id)) {
       removeFromShortlist(profile.id);
     } else {
@@ .. @@
               <div>
                 <select
                   value={selectedRole}
                   onChange={(e) => setSelectedRole(e.target.value)}
                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                 >
-                  {roles.map(role => (
+                  {roleOptions.map(role => (
                     <option key={role} value={role}>{role}</option>
                   ))}
                 </select>
@@ .. @@
         {/* Results Section */}
         {showResults ? (
           <div className="bg-white rounded-2xl shadow-lg p-6">
-            <h3 className="text-xl font-bold text-[#222222] mb-6">
-              Search Results ({filteredProfiles.length} found)
-            </h3>
-            
-            {filteredProfiles.length > 0 ? (
-              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
-                {filteredProfiles.map((profile) => (
-                  <div
-                    key={profile.id}
-                    className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
-                  >
-                    <div className="p-6">
-                      <div className="flex items-start justify-between mb-4">
-                        <div className="flex items-center space-x-3">
-                          <img
-                            src={profile.profileImage}
-                            alt={profile.name}
-                            className="w-12 h-12 rounded-full object-cover"
-                          />
-                          <div>
-                            <h4 className="font-semibold text-[#222222]">{profile.name}</h4>
-                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRoleColor(profile.role)}`}>
-                              {profile.role}
-                            </span>
+            {searchLoading ? (
+              <div className="text-center py-12">
+                <p className="text-[#555555] text-lg">Searching...</p>
+              </div>
+            ) : searchError ? (
+              <div className="text-center py-12">
+                <p className="text-red-500 text-lg mb-4">Error: {searchError}</p>
+                <button
+                  onClick={() => searchProfiles()}
+                  className="bg-[#003366] text-white px-6 py-2 rounded-lg hover:bg-[#004080] transition-colors"
+                >
+                  Try Again
+                </button>
+              </div>
+            ) : (
+              <>
+                <h3 className="text-xl font-bold text-[#222222] mb-6">
+                  Search Results ({searchData?.profiles.length || 0} found)
+                </h3>
+                
+                {searchData?.profiles && searchData.profiles.length > 0 ? (
+                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
+                    {searchData.profiles.map((profile) => (
+                      <div
+                        key={profile.id}
+                        className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
+                      >
+                        <div className="p-6">
+                          <div className="flex items-start justify-between mb-4">
+                            <div className="flex items-center space-x-3">
+                              {profile.profileImage ? (
+                                <img
+                                  src={profile.profileImage}
+                                  alt={profile.name}
+                                  className="w-12 h-12 rounded-full object-cover"
+                                />
+                              ) : (
+                                <div className="w-12 h-12 bg-[#003366] rounded-full flex items-center justify-center">
+                                  <User className="text-white" size={20} />
+                                </div>
+                              )}
+                              <div>
+                                <h4 className="font-semibold text-[#222222]">{profile.name}</h4>
+                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRoleColor(profile.role)}`}>
+                                  {profile.role}
+                                </span>
+                              </div>
+                            </div>
+                            <button
+                              onClick={() => handleShortlistToggle(profile)}
+                              className={`p-2 rounded-full transition-colors ${
+                                isShortlisted(profile.id)
+                                  ? 'bg-[#FF9933] text-white'
+                                  : 'bg-gray-100 text-gray-500 hover:bg-[#FF9933] hover:text-white'
+                              }`}
+                            >
+                              <Heart size={16} />
+                            </button>
                           </div>
-                        </div>
-                        <button
-                          onClick={() => handleShortlistToggle(profile)}
-                          className={`p-2 rounded-full transition-colors ${
-                            isShortlisted(profile.id)
-                              ? 'bg-[#FF9933] text-white'
-                              : 'bg-gray-100 text-gray-500 hover:bg-[#FF9933] hover:text-white'
-                          }`}
-                        >
-                          <Heart size={16} />
-                        </button>
-                      </div>
 
-                      <h5 className="font-semibold text-[#222222] mb-2">{profile.serviceName}</h5>
-                      <p className="text-[#555555] text-sm mb-4 line-clamp-2">{profile.bio}</p>
+                          <h5 className="font-semibold text-[#222222] mb-2">{profile.serviceName || 'Service Provider'}</h5>
+                          <p className="text-[#555555] text-sm mb-4 line-clamp-2">{profile.bio || 'No description available'}</p>
 
-                      <div className="flex items-center justify-between mb-4">
-                        <div className="flex items-center text-[#555555] text-sm">
-                          <MapPin size={14} className="mr-1" />
-                          {profile.location}
-                        </div>
-                        <div className="text-[#003366] font-bold text-lg">
-                          {profile.price}
+                          <div className="flex items-center justify-between mb-4">
+                            <div className="flex items-center text-[#555555] text-sm">
+                              <MapPin size={14} className="mr-1" />
+                              {profile.location || 'Location not specified'}
+                            </div>
+                            <div className="text-[#003366] font-bold text-lg">
+                              {profile.price || 'Price on request'}
+                            </div>
+                          </div>
+
+                          <Link
+                            to={`/profile/${profile.id}`}
+                            onClick={() => handleProfileClick(profile)}
+                            className="w-full bg-[#003366] text-white py-2 rounded-lg font-semibold hover:bg-[#004080] transition-colors text-center block"
+                          >
+                            View Profile
+                          </Link>
                         </div>
                       </div>
-
-                      <Link
-                        to={`/profile/${profile.id}`}
-                        onClick={() => handleProfileClick(profile)}
-                        className="w-full bg-[#003366] text-white py-2 rounded-lg font-semibold hover:bg-[#004080] transition-colors text-center block"
-                      >
-                        View Profile
-                      </Link>
-                    </div>
+                    ))}
                   </div>
-                ))}
-              </div>
-            ) : (
-              <div className="text-center py-12">
-                <p className="text-[#555555] text-lg mb-4">
-                  No service providers found for your search criteria.
-                </p>
-                <p className="text-[#555555]">
-                  Try adjusting your location or service type filters.
-                </p>
-              </div>
+                ) : (
+                  <div className="text-center py-12">
+                    <p className="text-[#555555] text-lg mb-4">
+                      No service providers found for your search criteria.
+                    </p>
+                    <p className="text-[#555555]">
+                      Try adjusting your location or service type filters.
+                    </p>
+                  </div>
+                )}
+              </>
             )}
           </div>
         ) : (
@@ .. @@
 };

 export default Marketplace;