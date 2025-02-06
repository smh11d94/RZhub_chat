'use client'

import { useAuthenticator } from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import { generateClient } from "aws-amplify/data";
import { type Schema } from "@/amplify/data/resource";
import { useState, FormEvent, useEffect } from "react";

Amplify.configure(outputs);

const CourseInformationPage = () => {
    const { signOut } = useAuthenticator();
    const client = generateClient<Schema>();
    
    const [courses, setCourses] = useState<any[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<any>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState<any>(null);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [formData, setFormData] = useState({
      courseName: '',
      courseInstructor: '',
      courseInfo: JSON.stringify({
        gradeScheme: '',
        midtermDates: '',
        finalDate: '',
        officeHours: '',
        textBook: '',
        extraInformation: ''
      }, null, 2)
    });
    
    const [message, setMessage] = useState('');

    const clearMessage = () => {
      setMessage('');
    };

    useEffect(() => {
      fetchCourses();
    }, []);

    const fetchCourses = async () => {
      try {
        const result = await client.models.CourseInfo.list();
        if (result.data) {
          setCourses(result.data);
        } else {
          setCourses([]);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        setCourses([]);
      }
    };

    const handleCourseSelect = async (course: any) => {
      setSelectedCourse(course);
      const courseInfo = JSON.parse(course.courseInfo);
      setFormData({
        courseName: course.courseName,
        courseInstructor: course.courseInstructor,
        courseInfo: JSON.stringify({
          gradeScheme: courseInfo.gradeScheme || '',
          midtermDates: courseInfo.midtermDates || '',
          finalDate: courseInfo.finalDate || '',
          officeHours: courseInfo.officeHours || '',
          textBook: courseInfo.textBook || '',
          extraInformation: courseInfo.extraInformation || ''
        }, null, 2)
      });
    };
  
    const handleSubmit = async (e: FormEvent) => {
      e.preventDefault();
      
      try {
        if (selectedCourse?.id) {
          const result = await client.models.CourseInfo.update({
            id: selectedCourse.id,
            ...formData
          });
          setMessage('Course information updated successfully!');
          setTimeout(clearMessage, 3000);
        } else {
          const result = await client.models.CourseInfo.create({
            ...formData
          });
          setMessage('Course information saved successfully!');
          setTimeout(clearMessage, 3000);
        }
        
        await fetchCourses();
        resetForm();
      } catch (error) {
        console.error('Detailed error:', error);
        if (error instanceof Error) {
          setMessage(`Error saving course information: ${error.message}`);
          setTimeout(clearMessage, 3000);
        } else {
          setMessage('Error saving course information');
          setTimeout(clearMessage, 3000);
        }
      }
    };

    const handleDelete = async () => {
      if (deleteConfirmText.toLowerCase() !== 'delete') return;
      
      try {
        if (!courseToDelete?.id) {
          throw new Error('Invalid course ID');
        }

        const deleted = await client.models.CourseInfo.delete({
          id: courseToDelete.id
        });

        if (deleted) {
          setMessage('Course deleted successfully!');
          setTimeout(clearMessage, 3000);
          await fetchCourses();
          setIsDeleteDialogOpen(false);
          setDeleteConfirmText('');
          setCourseToDelete(null);
          if (selectedCourse?.id === courseToDelete.id) {
            resetForm();
          }
        } else {
          throw new Error('Failed to delete course');
        }
      } catch (error) {
        console.error('Error deleting course:', error);
        if (error instanceof Error) {
          setMessage(`Error deleting course: ${error.message}`);
          setTimeout(clearMessage, 3000);
        } else {
          setMessage('Error deleting course');
          setTimeout(clearMessage, 3000);
        }
      }
    };

    const resetForm = () => {
      setFormData({
        courseName: '',
        courseInstructor: '',
        courseInfo: JSON.stringify({
          gradeScheme: '',
          midtermDates: '',
          finalDate: '',
          officeHours: '',
          textBook: '',
          extraInformation: ''
        }, null, 2)
      });
      setSelectedCourse(null);
    };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-[80%] mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Course Management System</h1>
          <button
            onClick={signOut}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition duration-150"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="max-w-[80%] mx-auto px-4 py-6 flex gap-6">
        {/* Side Menu */}
        <div className="w-64 bg-white rounded-lg shadow-sm p-4 h-fit">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700">Available Courses</h2>
            <button
              onClick={resetForm}
              className="p-1 hover:bg-gray-100 rounded-full"
              title="Create New Course"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6 text-indigo-600" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 4v16m8-8H4" 
                />
              </svg>
            </button>
          </div>
          <ul className="space-y-2">
            {courses.map((course) => (
              <li 
                key={course.id}
                className={`p-3 rounded-md flex justify-between items-center transition duration-150 ${
                  selectedCourse?.id === course.id 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <span 
                  className="cursor-pointer flex-1 font-medium"
                  onClick={() => handleCourseSelect(course)}
                >
                  {course.courseName}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCourseToDelete(course);
                    setIsDeleteDialogOpen(true);
                  }}
                  className="p-1 hover:bg-gray-200 rounded-full"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-white rounded-lg shadow-sm p-6">
          {message && (
            <div className={`p-4 mb-6 rounded-md ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="courseName" className="block text-sm font-medium text-gray-700 mb-1">
                  Course Name
                </label>
                <input
                  type="text"
                  id="courseName"
                  name="courseName"
                  value={formData.courseName}
                  onChange={(e) => setFormData(prev => ({ ...prev, courseName: e.target.value }))}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="courseInstructor" className="block text-sm font-medium text-gray-700 mb-1">
                  Course Instructor
                </label>
                <input
                  type="text"
                  id="courseInstructor"
                  name="courseInstructor"
                  value={formData.courseInstructor}
                  onChange={(e) => setFormData(prev => ({ ...prev, courseInstructor: e.target.value }))}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Course Details</h3>
              
              {Object.entries(JSON.parse(formData.courseInfo)).map(([key, value]) => (
                <div key={key} className="bg-gray-50 p-4 rounded-md">
                  <label htmlFor={key} className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  <textarea
                    id={key}
                    value={value as string}
                    onChange={(e) => {
                      const updatedInfo = JSON.parse(formData.courseInfo);
                      updatedInfo[key] = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        courseInfo: JSON.stringify(updatedInfo, null, 2)
                      }));
                    }}
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                {selectedCourse ? 'Update Course' : 'Save Course'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Reset Form
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Delete Course</h3>
            <p className="mb-4">
              Are you sure you want to delete "{courseToDelete?.courseName}"? 
              Type "delete" to confirm.
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type 'delete' to confirm"
              className="w-full p-2 border rounded-md mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setDeleteConfirmText('');
                  setCourseToDelete(null);
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteConfirmText.toLowerCase() !== 'delete'}
                className={`px-4 py-2 text-white rounded-md ${
                  deleteConfirmText.toLowerCase() === 'delete'
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-red-300 cursor-not-allowed'
                }`}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseInformationPage;