import { useState } from 'react';
import {
    FaGraduationCap, FaBriefcase, FaChevronLeft, FaBookOpen,
    FaCode, FaUsers, FaPalette, FaTrophy
} from 'react-icons/fa';
import { userConfig } from '../../config/userConfig';
import DraggableWindow from './DraggableWindow';

interface NotesAppProps {
    isOpen: boolean;
    onClose: () => void;
}

type Section =
    | 'menu'
    | 'education'
    | 'experience'
    | 'courses'
    | 'skills'
    | 'roles'
    | 'activities'
    | 'competitions';

// Type for storing image indices per item
type ImageIndicesState = Record<string, number>;

interface Image {
    url: string;
    alt?: string;
    description?: string;
}

const NotesApp = ({ isOpen, onClose }: NotesAppProps) => {
    const [activeSection, setActiveSection] = useState<Section>('menu');
    // Store image indices in an object: { 'itemId': index }
    const [activeImageIndices, setActiveImageIndices] = useState<ImageIndicesState>({});

    const handleSectionClick = (section: Section) => {
        setActiveSection(section);
        // No need to reset image indices globally here, 
        // they are per-item now and will default to 0 if not set
    };

    const handleBackClick = () => {
        setActiveSection('menu');
    };

    // Update image index for a specific item
    const handleNextImage = (itemId: string, images: readonly Image[]) => {
        setActiveImageIndices(prevIndices => ({
            ...prevIndices,
            [itemId]: ((prevIndices[itemId] ?? -1) + 1) % images.length
        }));
    };

    // Update image index for a specific item
    const handlePrevImage = (itemId: string, images: readonly Image[]) => {
        setActiveImageIndices(prevIndices => ({
            ...prevIndices,
            [itemId]: ((prevIndices[itemId] ?? 0) - 1 + images.length) % images.length
        }));
    };

    if (!isOpen) return null;

    const education = userConfig.education || [];
    const experience = userConfig.experience || [];
    const courses = userConfig.courses || [];
    const skills = userConfig.skills || [];
    const roles = userConfig.extraCurricularRoles || [];
    const activities = userConfig.extraCurricularActivities || [];
    const competitions = userConfig.competitions || [];

    const renderBackButton = () => (
        <button
            onClick={handleBackClick}
            className="flex items-center gap-2 text-gray-300 hover:text-gray-100 mb-4"
        >
            <FaChevronLeft />
            <span>Back to Menu</span>
        </button>
    );

    // Accepts itemId to manage state correctly
    const renderImageCarousel = (itemId: string, images: readonly Image[]) => {
        const currentIndex = activeImageIndices[itemId] ?? 0;
        if (!images || images.length === 0 || currentIndex >= images.length) {
            return null;
        }

        return (
            <div className="mt-4">
                <div className="rounded-lg overflow-hidden mb-2">
                    <img
                        src={images[currentIndex].url}
                        alt={images[currentIndex].alt}
                        className="w-full h-48 object-contain bg-gray-900 rounded-lg"
                    />
                </div>

                <div className="text-sm text-gray-400 mb-3">
                    {images[currentIndex].description}
                </div>

                {images.length > 1 && (
                    <div className="flex justify-between mt-2">
                        <button
                            onClick={() => handlePrevImage(itemId, images)}
                            className="bg-gray-700 hover:bg-gray-600 text-white rounded-full w-8 h-8 flex items-center justify-center"
                        >
                            ←
                        </button>
                        <span className="text-gray-400">
                            {currentIndex + 1} / {images.length}
                        </span>
                        <button
                            onClick={() => handleNextImage(itemId, images)}
                            className="bg-gray-700 hover:bg-gray-600 text-white rounded-full w-8 h-8 flex items-center justify-center"
                        >
                            →
                        </button>
                    </div>
                )}
            </div>
        );
    };

    const renderEducation = () => (
        <div className="space-y-6">
            {renderBackButton()}
            <h2 className="text-2xl font-bold text-gray-200 mb-6">Education</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {education.map((item, index) => {
                    const itemId = `education-${index}`;
                    return (
                        <div key={itemId} className="bg-gray-800/50 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                            <h3 className="text-xl font-semibold text-gray-200 mb-2">{item.degree} {item.major && `- ${item.major}`}</h3>
                            <div className="text-gray-300 mb-2">{item.institution}, {item.location}</div>
                            <div className="text-gray-400 mb-3">{item.year}</div>
                            <p className="text-gray-300 mb-4">{item.description}</p>
                            {item.images && item.images.length > 0 && renderImageCarousel(itemId, item.images)}
                        </div>
                    );
                })}
            </div>
        </div>
    );

    const renderExperience = () => (
        <div className="space-y-6">
            {renderBackButton()}
            <h2 className="text-2xl font-bold text-gray-200 mb-6">Professional Experience</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {experience.map((item, index) => {
                    const itemId = `experience-${index}`;
                    return (
                        <div key={itemId} className="bg-gray-800/50 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                            <h3 className="text-xl font-semibold text-gray-200 mb-2">{item.title}</h3>
                            <div className="text-gray-300 mb-2">{item.company}, {item.location}</div>
                            <div className="text-gray-400 mb-3">{item.period}</div>
                            <p className="text-gray-300 mb-4">{item.description}</p>
                            {item.technologies && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {item.technologies.map((tech, i) => (
                                        <span key={i} className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300">
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            )}
                            {item.images && item.images.length > 0 && renderImageCarousel(itemId, item.images)}
                        </div>
                    );
                })}
            </div>
        </div>
    );

    const renderCourses = () => (
        <div className="space-y-6">
            {renderBackButton()}
            <h2 className="text-2xl font-bold text-gray-200 mb-6">Courses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {courses.map((item, index) => {
                    const itemId = `courses-${index}`;
                    return (
                        <div key={itemId} className="bg-gray-800/50 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                            <h3 className="text-xl font-semibold text-gray-200 mb-2">{item.title}</h3>
                            <div className="text-gray-300 mb-2">{item.institution}, {item.location}</div>
                            <div className="text-gray-400 mb-3">{item.year}</div>
                            <p className="text-gray-300 mb-4">{item.description}</p>
                            {item.images && item.images.length > 0 && renderImageCarousel(itemId, item.images)}
                        </div>
                    );
                })}
            </div>
        </div>
    );

    const renderSkills = () => (
        <div className="space-y-6">
            {renderBackButton()}
            <h2 className="text-2xl font-bold text-gray-200 mb-6">Skills</h2>
            <div className="bg-gray-800/50 p-6 rounded-xl shadow-lg">
                <div className="flex flex-wrap gap-2">
                    {skills.map((skill, index) => (
                        <span key={index} className="px-3 py-1 bg-gray-700 rounded text-sm text-gray-300">
                            {skill}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderExtraCurricularRoles = () => (
        <div className="space-y-6">
            {renderBackButton()}
            <h2 className="text-2xl font-bold text-gray-200 mb-6">Extracurricular Roles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {roles.map((item, index) => {
                    const itemId = `roles-${index}`;
                    return (
                        <div key={itemId} className="bg-gray-800/50 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                            <h3 className="text-xl font-semibold text-gray-200 mb-2">{item.role}</h3>
                            <div className="text-gray-300 mb-2">{item.institution}, {item.location}</div>
                            <div className="text-gray-400 mb-3">{item.year}</div>
                            {item.images && item.images.length > 0 && renderImageCarousel(itemId, item.images)}
                        </div>
                    );
                })}
            </div>
        </div>
    );

    const renderExtraCurricularActivities = () => (
        <div className="space-y-6">
            {renderBackButton()}
            <h2 className="text-2xl font-bold text-gray-200 mb-6">Extracurricular Activities</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activities.map((item, index) => {
                    const itemId = `activities-${index}`;
                    return (
                        <div key={itemId} className="bg-gray-800/50 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                            <h3 className="text-xl font-semibold text-gray-200 mb-2">{item.title}</h3>
                            <div className="text-gray-300 mb-2">{item.institution}, {item.location}</div>
                            <div className="text-gray-400 mb-3">{item.year}</div>
                            {item.images && item.images.length > 0 && renderImageCarousel(itemId, item.images)}
                        </div>
                    );
                })}
            </div>
        </div>
    );

    const renderCompetitions = () => (
        <div className="space-y-6">
            {renderBackButton()}
            <h2 className="text-2xl font-bold text-gray-200 mb-6">Competitions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {competitions.map((item, index) => {
                    const itemId = `competitions-${index}`;
                    return (
                        <div key={itemId} className="bg-gray-800/50 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                            <h3 className="text-xl font-semibold text-gray-200 mb-2">{item.title}</h3>
                            <div className="text-gray-300 mb-2">{item.description}</div>
                            <div className="text-gray-400 mb-3">Achievement: {item.achievement} ({item.year})</div>
                            {item.images && item.images.length > 0 && renderImageCarousel(itemId, item.images)}
                        </div>
                    );
                })}
            </div>
        </div>
    );

    const renderMenu = () => (
        <div>
            <h2 className="text-2xl font-bold text-gray-200 mb-6">My Notes</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Competitions */}
                <div
                    className="bg-gray-800/50 p-4 rounded-lg cursor-pointer hover:bg-gray-700/50 transition-colors"
                    onClick={() => handleSectionClick('competitions')}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center">
                            <FaTrophy size={28} className="text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-200">Competitions</h3>
                    </div>
                    <p className="text-gray-400">View my competition history and achievements</p>
                </div>

                {/* Education */}
                <div
                    className="bg-gray-800/50 p-4 rounded-lg cursor-pointer hover:bg-gray-700/50 transition-colors"
                    onClick={() => handleSectionClick('education')}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                            <FaGraduationCap size={28} className="text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-200">Education</h3>
                    </div>
                    <p className="text-gray-400">View my educational background and qualifications</p>
                </div>

                {/* Experience */}
                <div
                    className="bg-gray-800/50 p-4 rounded-lg cursor-pointer hover:bg-gray-700/50 transition-colors"
                    onClick={() => handleSectionClick('experience')}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                            <FaBriefcase size={28} className="text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-200">Professional Experience</h3>
                    </div>
                    <p className="text-gray-400">Explore my professional work experience</p>
                </div>
                {/* Extracurricular Roles */}
                <div
                    className="bg-gray-800/50 p-4 rounded-lg cursor-pointer hover:bg-gray-700/50 transition-colors"
                    onClick={() => handleSectionClick('roles')}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
                            <FaUsers size={28} className="text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-200">Extracurricular Roles</h3>
                    </div>
                    <p className="text-gray-400">My involvement in student activities and roles</p>
                </div>

                {/* Extracurricular Activities */}
                <div
                    className="bg-gray-800/50 p-4 rounded-lg cursor-pointer hover:bg-gray-700/50 transition-colors"
                    onClick={() => handleSectionClick('activities')}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-pink-600 rounded-xl flex items-center justify-center">
                            <FaPalette size={28} className="text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-200">Extracurricular Activities</h3>
                    </div>
                    <p className="text-gray-400">My participation in events and activities</p>
                </div>
                {/* Courses */}
                <div
                    className="bg-gray-800/50 p-4 rounded-lg cursor-pointer hover:bg-gray-700/50 transition-colors"
                    onClick={() => handleSectionClick('courses')}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                            <FaBookOpen size={28} className="text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-200">Courses</h3>
                    </div>
                    <p className="text-gray-400">Check out courses I have completed</p>
                </div>

                {/* Skills */}
                <div
                    className="bg-gray-800/50 p-4 rounded-lg cursor-pointer hover:bg-gray-700/50 transition-colors"
                    onClick={() => handleSectionClick('skills')}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center">
                            <FaCode size={28} className="text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-200">Skills</h3>
                    </div>
                    <p className="text-gray-400">See my technical skills and expertise</p>
                </div>
            </div>
        </div>
    );

    const getWindowTitle = () => {
        switch (activeSection) {
            case 'menu': return 'Notes';
            case 'education': return 'Education Notes';
            case 'experience': return 'Experience Notes';
            case 'courses': return 'Courses Notes';
            case 'skills': return 'Skills Notes';
            case 'roles': return 'Extracurricular Roles Notes';
            case 'activities': return 'Extracurricular Activities Notes';
            case 'competitions': return 'Competitions Notes';
            default: return 'Notes';
        }
    };

    return (
        <DraggableWindow
            title={getWindowTitle()}
            onClose={onClose}
            initialPosition={{ 
                x: Math.floor(window.innerWidth * 0.3), 
                y: Math.floor(window.innerHeight * 0.2) 
            }}
            className="w-[93vw] md:max-w-4xl max-h-[90vh] flex flex-col"
            initialSize={{ width: 700, height: 600 }}
        >
            <div className="flex flex-col flex-grow min-h-0 h-full">
                <div className="overflow-y-auto flex-grow min-h-0 p-4 md:p-6">
                    {activeSection === 'menu' && renderMenu()}
                    {activeSection === 'education' && renderEducation()}
                    {activeSection === 'experience' && renderExperience()}
                    {activeSection === 'courses' && renderCourses()}
                    {activeSection === 'skills' && renderSkills()}
                    {activeSection === 'roles' && renderExtraCurricularRoles()}
                    {activeSection === 'activities' && renderExtraCurricularActivities()}
                    {activeSection === 'competitions' && renderCompetitions()}
                </div>
            </div>
        </DraggableWindow>
    );
};

export default NotesApp; 