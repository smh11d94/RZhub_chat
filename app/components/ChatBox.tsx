"use client"
import { useState, useRef, useEffect } from 'react'
import { Card } from './ui/card'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Message } from './Message'
import { Send, Loader2 } from 'lucide-react'
import { generateClient } from "aws-amplify/data"
import { type Schema } from "@/amplify/data/resource"

export default function ChatBox() {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant' | 'system'; content: string }[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [userName, setUserName] = useState('')
  const [isNameSubmitted, setIsNameSubmitted] = useState(false)
  const [courseSelected, setCourseSelected] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<any>(null)
  const [courses, setCourses] = useState<any[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const client = generateClient<Schema>()

  // Fetch courses on component mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const result = await client.models.CourseInfo.list()
        setCourses(result.data)
      } catch (error) {
        console.error('Error fetching courses:', error)
      }
    }
    fetchCourses()
  }, [])

  const handleCourseSelect = (course: any) => {
    setSelectedCourse(course)
    setCourseSelected(true)
  }

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (userName.trim()) {
      setIsNameSubmitted(true)
    }
  }

  async function handleSubmit() {
    if (!input.trim() || loading) return
    
    setLoading(true)
    setMessages(prev => [...prev, { role: 'user', content: input }])
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: input,
          userName: userName,
          courseInfo: selectedCourse // Send course info to the API
        })
      })
      
      if (!response.ok) throw new Error('Failed to send message')
      
      const data = await response.json()
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.message,
        emailDetails: data.emailDetails,
        includeEmailButton: data.includeEmailButton 
      }])
    } catch (error) {
      console.error(error)
      setMessages(prev => [...prev, { 
        role: 'system', 
        content: 'Failed to send message. Please try again.' 
      }])
    }
    
    setLoading(false)
    setInput('')
  }

  // Course selection screen
  if (!courseSelected) {
    return (
      <Card className="w-full max-w-2xl mx-auto h-[600px] flex flex-col bg-gradient-to-b from-gray-50 to-white shadow-xl">
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <h2 className="text-2xl font-semibold text-center text-gray-700 mb-6">
            Select Your Course
          </h2>
          <div className="grid grid-cols-1 gap-4 w-full max-w-md">
            {courses.map((course) => (
              <Button
                key={course.id}
                onClick={() => handleCourseSelect(course)}
                className="w-full p-4 text-left bg-white hover:bg-gray-50 border-2 border-gray-200 rounded-lg"
              >
                <div className="font-medium">{course.courseName}</div>
                <div className="text-sm text-gray-500">
                  {course.courseName}
                </div>
              </Button>
            ))}
          </div>
        </div>
      </Card>
    )
  }

  // Name input screen
  if (!isNameSubmitted) {
    return (
      <Card className="w-full max-w-2xl mx-auto h-[600px] flex flex-col bg-gradient-to-b from-gray-50 to-white shadow-xl">
        <div className="flex-1 flex items-center justify-center">
          <form onSubmit={handleNameSubmit} className="w-full max-w-md p-8 space-y-4">
            <h2 className="text-2xl font-semibold text-center text-gray-700">
              Welcome to {selectedCourse.courseName}! 👋
            </h2>
            <h2 className="font-semibold text-center text-gray-700">
              What's Your Name?
            </h2>
            <Input
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name"
              className="focus-visible:ring-2 focus-visible:ring-blue-500"
            />
            <Button 
              type="submit"
              disabled={!userName.trim()} 
              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
            >
              Start Chat
            </Button>
          </form>
        </div>
      </Card>
    )
  }

  // Rest of your existing chat interface code...
  return (
    <Card className="w-full max-w-2xl mx-auto h-[700px] flex flex-col bg-gradient-to-b from-gray-50 to-white shadow-xl">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400">
            Hi {userName}, start a conversation...
          </div>
        ) : (
          messages.map((message, i) => (
            <Message key={i} message={message} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t bg-white">
        <form 
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmit()
          }} 
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            disabled={loading}
            className="focus-visible:ring-2 focus-visible:ring-blue-500"
          />
          <Button 
            type="submit"
            disabled={loading || !input.trim()} 
            className="px-4 bg-blue-500 hover:bg-blue-600 text-white"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </form>
      </div>
    </Card>
  )
}

