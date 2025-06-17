// components/SidePanel/ProposalForm.jsx
import { useState, useEffect } from 'react';
import useUiStore from '../../store/uiStore';
import { useSubmitProposal } from '../../hooks/useCulturalSitesQueries';

const ProposalForm = () => {
  const { proposalFormData, closeProposalForm, closeSidePanel } = useUiStore();
  const submitMutation = useSubmitProposal();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    imageUrl: '',
    openingHours: '',
    address: '',
    website: '', // Now editable
    proposalMessage: '',
    location: null,
    licenseInfo: '',
    sourceId: '',
    originalTags: {},
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (proposalFormData) {
      setFormData({
        name: proposalFormData.name || '',
        description: proposalFormData.description || '',
        category: proposalFormData.category || '',
        imageUrl: proposalFormData.imageUrl || '',
        openingHours: proposalFormData.openingHours || '',
        address: proposalFormData.address || '',
        website: proposalFormData.website || '', // Initialize with existing website
        proposalMessage: '',
        location: proposalFormData.location,
        licenseInfo: proposalFormData.licenseInfo || '',
        sourceId: proposalFormData.sourceId || '',
        originalTags: proposalFormData.originalTags || {},
      });
      setFormErrors({});
    }
  }, [proposalFormData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    if (formErrors[name]) {
      setFormErrors((prevErrors) => ({ ...prevErrors, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Cultural site name is required.';
    if (!formData.category.trim()) errors.category = 'Category is required.';
    if (!formData.address.trim()) errors.address = 'Address is required.';
    if (!formData.proposalMessage.trim()) errors.proposalMessage = 'Proposal message is required.';
    if (!formData.location || !formData.location.coordinates || formData.location.coordinates.length !== 2) {
      errors.location = 'Invalid location information.';
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const proposalBody = {
      proposalType: "create",
      proposalMessage: formData.proposalMessage,
      name: formData.name,
      description: formData.description,
      category: formData.category,
      location: formData.location,
      address: formData.address,
      website: formData.website, // Now includes website as editable
      imageUrl: formData.imageUrl,
      openingHours: formData.openingHours,
      licenseInfo: formData.licenseInfo,
      sourceId: formData.sourceId,
      originalTags: formData.originalTags,
    };

    try {
      await submitMutation.mutateAsync(proposalBody);
      alert('Proposal submitted successfully!');
      closeProposalForm();
      closeSidePanel();
    } catch (error) {
      alert(`Proposal submission failed: ${error.response?.data?.message || error.message || 'Unknown error'}`);
    }
  };

  if (submitMutation.isLoading) { // Display loading message while submitting
    return (
      <div className="p-4 text-gray-600 text-center relative">
         <div className="absolute top-4 right-4">
            <button
              className="text-gray-500 hover:text-gray-700 text-4xl font-bold hover:cursor-pointer p-1"
              onClick={closeProposalForm}
              aria-label="Close proposal form"
            >
              &times;
            </button>
          </div>
        <p className="mt-10">Submitting proposal...</p>
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mx-auto mt-4"></div>
      </div>
    );
  }

  if (!proposalFormData) {
    return <div className="p-4 text-gray-600 text-center">Loading cultural site information to propose...</div>;
  }

  const categories = ['artwork', 'gallery', 'museum', 'restaurant', 'theatre', 'arts_centre', 'community_centre', 'library', 'cinema', 'other'];

  return (
    <div className="flex-grow overflow-y-auto p-4 relative">
      <div className="absolute top-4 right-4 z-10">
        <button
          className="text-gray-500 hover:text-gray-700 text-4xl font-bold hover:cursor-pointer p-1"
          onClick={closeProposalForm}
          aria-label="Close proposal form"
        >
          &times;
        </button>
      </div>

      <h2 className="text-xl font-bold mb-4 pr-10">Propose New Cultural Site</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Editable Fields */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
          ></textarea>
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category *</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Category</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat.replace(/_/g, ' ')}</option>
            ))}
          </select>
          {formErrors.category && <p className="text-red-500 text-xs mt-1">{formErrors.category}</p>}
        </div>

        <div>
          <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">Image URL</label>
          <input
            type="url"
            id="imageUrl"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., http://example.com/image.jpg"
          />
        </div>

        <div>
          <label htmlFor="openingHours" className="block text-sm font-medium text-gray-700">Opening Hours</label>
          <input
            type="text"
            id="openingHours"
            name="openingHours"
            value={formData.openingHours}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Mo-Fr 09:00-17:00"
          />
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address *</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {formErrors.address && <p className="text-red-500 text-xs mt-1">{formErrors.address}</p>}
        </div>

        <div>
          <label htmlFor="website" className="block text-sm font-medium text-gray-700">Website</label>
          <input
            type="url"
            id="website"
            name="website"
            value={formData.website}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., https://example.com"
          />
        </div>

        {/* Non-editable fields (display only) - Crucial for server-side validation */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Latitude (Read-Only)</label>
          <input
            type="text"
            value={formData.location?.coordinates[1] || ''}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100 cursor-not-allowed"
            readOnly
          />
          {formErrors.location && <p className="text-red-500 text-xs mt-1">{formErrors.location}</p>} {/* Error for location */}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Longitude (Read-Only)</label>
          <input
            type="text"
            value={formData.location?.coordinates[0] || ''}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100 cursor-not-allowed"
            readOnly
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Original OSM ID (Read-Only)</label>
          <input
            type="text"
            value={formData.sourceId}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100 cursor-not-allowed"
            readOnly
          />
        </div>
        {/* originalTags and licenseInfo can be displayed as read-only too if useful for user context */}

        {/* Proposal Message (Mandatory) */}
        <div>
          <label htmlFor="proposalMessage" className="block text-sm font-medium text-gray-700">Proposal Message *</label>
          <textarea
            id="proposalMessage"
            name="proposalMessage"
            value={formData.proposalMessage}
            onChange={handleChange}
            rows="4"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Please provide a detailed reason for proposing this cultural site."
          ></textarea>
          {formErrors.proposalMessage && <p className="text-red-500 text-xs mt-1">{formErrors.proposalMessage}</p>}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          disabled={submitMutation.isLoading}
        >
          {submitMutation.isLoading ? 'Submitting...' : 'Submit Proposal'}
        </button>
        {/* {submitMutation.isError && (
          <p className="text-red-500 text-sm mt-2 text-center">Submission Error: {submitMutation.error.message}</p>
        )} */}
      </form>
    </div>
  );
};

export default ProposalForm;