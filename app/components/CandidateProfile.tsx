"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useCandidate, useProfileActions } from '../lib/hooks';
import { CandidateProfile, SkillLevel, Education, Experience } from '../lib/types';
import { format } from 'date-fns';

interface CandidateProfileDisplayProps {
  className?: string;
  showEditMode?: boolean;
  onProfileUpdate?: (profile: Partial<CandidateProfile>) => void;
  onExport?: (profile: CandidateProfile) => void;
}

export function CandidateProfileDisplay({
  className = '',
  showEditMode = false,
  onProfileUpdate,
  onExport,
}: CandidateProfileDisplayProps) {
  const [isEditing, setIsEditing] = useState(showEditMode);
  const [editForm, setEditForm] = useState<Partial<CandidateProfile>>({});
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'experience' | 'education'>('overview');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));

  // Custom hooks
  const { candidateProfile, isLoading, error } = useCandidate();
  const { updateProfile, validateProfile } = useProfileActions();

  // Initialize edit form when profile changes
  useEffect(() => {
    if (candidateProfile) {
      setEditForm(candidateProfile);
    }
  }, [candidateProfile]);

  // Handle form field changes
  const handleFieldChange = (field: keyof CandidateProfile, value: any) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle skill changes
  const handleSkillChange = (index: number, field: keyof { name: string; level: SkillLevel; confidence: number }, value: any) => {
    if (!editForm.skills) return;
    
    const updatedSkills = [...editForm.skills];
    updatedSkills[index] = {
      ...updatedSkills[index],
      [field]: value,
    };
    
    handleFieldChange('skills', updatedSkills);
  };

  // Add new skill
  const addSkill = () => {
    const newSkill = {
      name: '',
      level: 'beginner' as SkillLevel,
      confidence: 0.5,
    };
    
    handleFieldChange('skills', [...(editForm.skills || []), newSkill]);
  };

  // Remove skill
  const removeSkill = (index: number) => {
    if (!editForm.skills) return;
    
    const updatedSkills = editForm.skills.filter((_, i) => i !== index);
    handleFieldChange('skills', updatedSkills);
  };

  // Save profile changes
  const handleSave = async () => {
    try {
      const validation = validateProfile(editForm);
      
      if (!validation.isValid) {
        alert(`Validation failed: ${validation.errors.join(', ')}`);
        return;
      }

      if (onProfileUpdate) {
        onProfileUpdate(editForm);
      } else {
        await updateProfile(editForm);
      }

      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('Failed to save profile changes');
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setEditForm(candidateProfile || {});
    setIsEditing(false);
  };

  // Toggle section expansion
  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  // Get confidence color
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  // Get skill level color
  const getSkillLevelColor = (level: SkillLevel) => {
    switch (level) {
      case 'expert': return 'text-purple-600 bg-purple-100';
      case 'advanced': return 'text-blue-600 bg-blue-100';
      case 'intermediate': return 'text-green-600 bg-green-100';
      case 'beginner': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Calculate overall profile completion
  const calculateCompletion = () => {
    if (!candidateProfile) return 0;
    
    const fields = ['name', 'email', 'phone', 'experience', 'skills', 'education'];
    const completedFields = fields.filter(field => {
      const value = candidateProfile[field as keyof CandidateProfile];
      return value && (Array.isArray(value) ? value.length > 0 : Boolean(value));
    });
    
    return Math.round((completedFields.length / fields.length) * 100);
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
        <div className="flex items-center space-x-3">
          <svg className="w-6 h-6 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div>
            <h3 className="text-lg font-medium text-red-800">Error Loading Profile</h3>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!candidateProfile) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-6 text-center ${className}`}>
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Profile Available</h3>
        <p className="text-gray-600">Start a conversation to build your candidate profile</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                {candidateProfile.name?.charAt(0) || 'C'}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {candidateProfile.name || 'Candidate Profile'}
              </h2>
              <p className="text-sm text-gray-600">
                Profile completion: {calculateCompletion()}%
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {onExport && (
              <button
                onClick={() => onExport(candidateProfile)}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Export
              </button>
            )}
            
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Edit Profile
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>Profile Completion</span>
          <span>{calculateCompletion()}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${calculateCompletion()}%` }}
          ></div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {(['overview', 'skills', 'experience', 'education'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <OverviewTab
            profile={candidateProfile}
            isEditing={isEditing}
            editForm={editForm}
            onFieldChange={handleFieldChange}
            expandedSections={expandedSections}
            onToggleSection={toggleSection}
            getConfidenceColor={getConfidenceColor}
          />
        )}

        {activeTab === 'skills' && (
          <SkillsTab
            profile={candidateProfile}
            isEditing={isEditing}
            editForm={editForm}
            onFieldChange={handleFieldChange}
            onSkillChange={handleSkillChange}
            onAddSkill={addSkill}
            onRemoveSkill={removeSkill}
            getSkillLevelColor={getSkillLevelColor}
            getConfidenceColor={getConfidenceColor}
          />
        )}

        {activeTab === 'experience' && (
          <ExperienceTab
            profile={candidateProfile}
            isEditing={isEditing}
            editForm={editForm}
            onFieldChange={handleFieldChange}
            expandedSections={expandedSections}
            onToggleSection={toggleSection}
          />
        )}

        {activeTab === 'education' && (
          <EducationTab
            profile={candidateProfile}
            isEditing={isEditing}
            editForm={editForm}
            onFieldChange={handleFieldChange}
            expandedSections={expandedSections}
            onToggleSection={toggleSection}
          />
        )}
      </div>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({
  profile,
  isEditing,
  editForm,
  onFieldChange,
  expandedSections,
  onToggleSection,
  getConfidenceColor,
}: {
  profile: CandidateProfile;
  isEditing: boolean;
  editForm: Partial<CandidateProfile>;
  onFieldChange: (field: keyof CandidateProfile, value: any) => void;
  expandedSections: Set<string>;
  onToggleSection: (section: string) => void;
  getConfidenceColor: (confidence: number) => string;
}) {
  const sections = [
    {
      id: 'personal',
      title: 'Personal Information',
      icon: '👤',
      fields: [
        { key: 'name', label: 'Full Name', type: 'text' },
        { key: 'email', label: 'Email', type: 'email' },
        { key: 'phone', label: 'Phone', type: 'tel' },
        { key: 'location', label: 'Location', type: 'text' },
      ],
    },
    {
      id: 'summary',
      title: 'Professional Summary',
      icon: '📝',
      fields: [
        { key: 'summary', label: 'Summary', type: 'textarea' },
        { key: 'experience', label: 'Years of Experience', type: 'number' },
        { key: 'availability', label: 'Availability', type: 'text' },
        { key: 'salaryExpectation', label: 'Salary Expectation', type: 'text' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <div key={section.id} className="bg-gray-50 rounded-lg p-4">
          <button
            onClick={() => onToggleSection(section.id)}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{section.icon}</span>
              <h3 className="text-lg font-medium text-gray-900">{section.title}</h3>
            </div>
            <svg
              className={`w-5 h-5 text-gray-500 transform transition-transform ${
                expandedSections.has(section.id) ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {expandedSections.has(section.id) && (
            <div className="mt-4 space-y-4">
              {section.fields.map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                  </label>
                  {isEditing ? (
                    field.type === 'textarea' ? (
                      <textarea
                        value={editForm[field.key as keyof CandidateProfile] || ''}
                        onChange={(e) => onFieldChange(field.key as keyof CandidateProfile, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                      />
                    ) : (
                      <input
                        type={field.type}
                        value={editForm[field.key as keyof CandidateProfile] || ''}
                        onChange={(e) => onFieldChange(field.key as keyof CandidateProfile, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )
                  ) : (
                    <div className="px-3 py-2 bg-white border border-gray-200 rounded-md">
                      {profile[field.key as keyof CandidateProfile] || 'Not specified'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Confidence Scores */}
      {profile.metadata?.confidence && (
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-blue-900 mb-3">Profile Confidence</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(profile.metadata.confidence)}`}>
                {Math.round(profile.metadata.confidence * 100)}% Confidence
              </div>
              <p className="text-xs text-blue-600 mt-1">Overall Profile</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-600">
                {profile.skills?.length || 0} Skills
              </div>
              <p className="text-xs text-green-600 mt-1">Identified</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Skills Tab Component
function SkillsTab({
  profile,
  isEditing,
  editForm,
  onFieldChange,
  onSkillChange,
  onAddSkill,
  onRemoveSkill,
  getSkillLevelColor,
  getConfidenceColor,
}: {
  profile: CandidateProfile;
  isEditing: boolean;
  editForm: Partial<CandidateProfile>;
  onFieldChange: (field: keyof CandidateProfile, value: any) => void;
  onSkillChange: (index: number, field: keyof { name: string; level: SkillLevel; confidence: number }, value: any) => void;
  onAddSkill: () => void;
  onRemoveSkill: (index: number) => void;
  getSkillLevelColor: (level: SkillLevel) => string;
  getConfidenceColor: (confidence: number) => string;
}) {
  const skills = editForm.skills || profile.skills || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Technical Skills</h3>
        {isEditing && (
          <button
            onClick={onAddSkill}
            className="px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            + Add Skill
          </button>
        )}
      </div>

      {skills.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <p>No skills identified yet</p>
          <p className="text-sm">Skills will be extracted as you chat</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {skills.map((skill, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              {isEditing ? (
                <div className="grid grid-cols-3 gap-4">
                  <input
                    type="text"
                    value={skill.name}
                    onChange={(e) => onSkillChange(index, 'name', e.target.value)}
                    placeholder="Skill name"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={skill.level}
                    onChange={(e) => onSkillChange(index, 'level', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={skill.confidence}
                      onChange={(e) => onSkillChange(index, 'confidence', parseFloat(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-600 w-12">
                      {Math.round(skill.confidence * 100)}%
                    </span>
                    <button
                      onClick={() => onRemoveSkill(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-medium text-gray-900">{skill.name}</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSkillLevelColor(skill.level)}`}>
                      {skill.level}
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(skill.confidence)}`}>
                      {Math.round(skill.confidence * 100)}% confidence
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Experience Tab Component
function ExperienceTab({
  profile,
  isEditing,
  editForm,
  onFieldChange,
  expandedSections,
  onToggleSection,
}: {
  profile: CandidateProfile;
  isEditing: boolean;
  editForm: Partial<CandidateProfile>;
  onFieldChange: (field: keyof CandidateProfile, value: any) => void;
  expandedSections: Set<string>;
  onToggleSection: (section: string) => void;
}) {
  const experiences = editForm.experience || profile.experience || [];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Work Experience</h3>
      
      {experiences.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.815-8.927-2.2M21 13.255v-3.255a3 3 0 00-3-3H6a3 3 0 00-3 3v3.255M21 13.255a23.931 23.931 0 01-8.927 2.2M21 13.255a23.931 23.931 0 00-8.927-2.2M21 13.255v-3.255a3 3 0 00-3-3H6a3 3 0 00-3 3v3.255M21 13.255a23.931 23.931 0 01-8.927 2.2" />
          </svg>
          <p>No work experience recorded yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {experiences.map((exp, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{exp.title}</h4>
                  <p className="text-sm text-gray-600">{exp.company}</p>
                  <p className="text-xs text-gray-500">
                    {exp.startDate && format(new Date(exp.startDate), 'MMM yyyy')} - 
                    {exp.endDate ? format(new Date(exp.endDate), ' MMM yyyy' : 'Present')}
                  </p>
                </div>
                <button
                  onClick={() => onToggleSection(`exp-${index}`)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className={`w-5 h-5 transform transition-transform ${
                      expandedSections.has(`exp-${index}`) ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {expandedSections.has(`exp-${index}`) && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-700">{exp.description}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Education Tab Component
function EducationTab({
  profile,
  isEditing,
  editForm,
  onFieldChange,
  expandedSections,
  onToggleSection,
}: {
  profile: CandidateProfile;
  isEditing: boolean;
  editForm: Partial<CandidateProfile>;
  onFieldChange: (field: keyof CandidateProfile, value: any) => void;
  expandedSections: Set<string>;
  onToggleSection: (section: string) => void;
}) {
  const education = editForm.education || profile.education || [];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Education</h3>
      
      {education.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          </svg>
          <p>No education information recorded yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {education.map((edu, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{edu.degree}</h4>
                  <p className="text-sm text-gray-600">{edu.institution}</p>
                  <p className="text-xs text-gray-500">
                    {edu.startDate && format(new Date(edu.startDate), 'yyyy')} - 
                    {edu.endDate ? format(new Date(edu.endDate), ' yyyy' : 'Present')}
                  </p>
                </div>
                <button
                  onClick={() => onToggleSection(`edu-${index}`)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className={`w-5 h-5 transform transition-transform ${
                      expandedSections.has(`edu-${index}`) ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {expandedSections.has(`edu-${index}`) && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-700">{edu.description}</p>
                  {edu.gpa && (
                    <p className="text-sm text-gray-600 mt-2">GPA: {edu.gpa}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
