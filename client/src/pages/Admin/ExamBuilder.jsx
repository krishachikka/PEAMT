import React, { useState, useEffect } from 'react';
import CustomRadioButton from './CustomRadioButton';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom'; // Import useNavigate

function ExamBuilder() {
  const [questions, setQuestions] = useState([]);
  const [examName, setExamName] = useState('');
  const [examOptions, setExamOptions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate

  const { currentUser } = useSelector((state) => state.user);
  const adminEmail = currentUser?.email || '';

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialExamName = queryParams.get('examName');

  useEffect(() => {
    if (initialExamName) {
      setExamName(initialExamName);
    }
  }, [initialExamName]);

  useEffect(() => {
    const fetchExams = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/exams`);
        const exams = response.data;
        const adminExams = exams.filter(exam => exam.adminEmail === adminEmail);
        setExamOptions(adminExams);
      } catch (error) {
        console.error('Error fetching exams:', error);
        setError('Error fetching exams.');
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, [adminEmail]);

  // Fetch questions and subjects
  useEffect(() => {
    if (examName) {
      const fetchExistingQuestions = async () => {
        setLoading(true);
        setError('');
        try {
          const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/examQuestions`, { params: { examName } });
          const existingQuestions = response.data.questions || [];
          setQuestions(existingQuestions);
        } catch (error) {
          console.error('Error fetching existing exam questions:', error);
          setError('Error fetching exam questions.');
        } finally {
          setLoading(false);
        }
      };

      const fetchSubjectsForExam = async () => {
        setLoading(true);
        try {
          const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/exams/subjects`, { params: { examName } });
          setSubjects(response.data);
        } catch (error) {
          console.error('Error fetching subjects:', error);
          setError('Error fetching subjects.');
        } finally {
          setLoading(false);
        }
      };

      fetchExistingQuestions();
      fetchSubjectsForExam();
    } else {
      setSubjects([]);
    }
  }, [examName]);

  useEffect(() => {
    // Get the converted JSON data from local storage
    const jsonData = localStorage.getItem('convertedExamQuestions');

    if (jsonData) {
      const questionsFromJson = JSON.parse(jsonData);

      // Transform the JSON data to match your question format
      const formattedQuestions = questionsFromJson.map((q, index) => ({
        id: questions.length + index + 1, // Ensure new IDs are unique
        text: q.question,
        type: q.choices.length > 0 ? 'MCQ' : 'Theory',
        options: q.choices.map(choice => choice.choice),
        correctAnswer: null, // Set this as needed
        marks: 0, // Default or fetched from your JSON
        difficulty: 'Medium', // Default or fetched from your JSON
        answerText: '',
        subject: ''
      }));

      // Append new questions to the existing ones
      setQuestions(prevQuestions => [...prevQuestions, ...formattedQuestions]);

      // Clear the stored data after using it
      localStorage.removeItem('convertedExamQuestions');
    }
  }, []);

  const handleExamNameChange = (event) => {
    setExamName(event.target.value);
  };

  const addQuestion = () => {
    const newQuestion = {
      id: questions.length + 1,
      text: '',
      type: 'MCQ',
      options: ['', '', '', ''],
      correctAnswer: null,
      marks: 0,
      difficulty: 'Medium',
      answerText: '',
      subject: ''
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestionText = (id, text) => {
    const updatedQuestions = questions.map((question) =>
      question.id === id ? { ...question, text } : question
    );
    setQuestions(updatedQuestions);
  };

  const updateOptionText = (questionId, optionIndex, optionText) => {
    const updatedQuestions = questions.map((question) => {
      if (question.id === questionId) {
        const updatedOptions = question.options.map((option, index) =>
          index === optionIndex ? optionText : option
        );
        return { ...question, options: updatedOptions };
      }
      return question;
    });
    setQuestions(updatedQuestions);
  };

  const updateCorrectAnswer = (questionId, correctAnswerIndex) => {
    const updatedQuestions = questions.map((question) =>
      question.id === questionId ? { ...question, correctAnswer: correctAnswerIndex } : question
    );
    setQuestions(updatedQuestions);
  };

  const updateQuestionType = (id, type) => {
    const updatedQuestions = questions.map((question) =>
      question.id === id ? { ...question, type } : question
    );
    setQuestions(updatedQuestions);
  };

  const updateQuestionMarks = (id, marks) => {
    const updatedQuestions = questions.map((question) =>
      question.id === id ? { ...question, marks: parseInt(marks) } : question
    );
    setQuestions(updatedQuestions);
  };

  const updateQuestionDifficulty = (id, difficulty) => {
    const updatedQuestions = questions.map((question) =>
      question.id === id ? { ...question, difficulty } : question
    );
    setQuestions(updatedQuestions);
  };

  const updateTheoryAnswerText = (id, answerText) => {
    const updatedQuestions = questions.map((question) =>
      question.id === id ? { ...question, answerText } : question
    );
    setQuestions(updatedQuestions);
  };

  const updateQuestionSubject = (id, subject) => {
    const updatedQuestions = questions.map((question) =>
      question.id === id ? { ...question, subject } : question
    );
    setQuestions(updatedQuestions);
  };

  const submitExamQuestions = async () => {
    setLoading(true);
    setError('');
    try {
      const data = {
        examName,
        questions,
        adminEmail,
      };
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/examQuestions`, data);
      if (response.status === 200 || response.status === 201) {
        alert('Exam questions submitted successfully');
        // Navigate back to the specific exam route after submission
        navigate(`/exam-builder?examName=${examName}`);
      } else {
        alert('Failed to submit exam questions');
      }
    } catch (error) {
      console.error('Error submitting exam questions:', error);
      alert('Failed to submit exam questions');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <section className='flex flex-row justify-between m-2'>
        <h2 className='font-bold text-2xl'>Prepare Exam Paper</h2>
        <button className='button' >Upload Paper </button>
        <button className='button' onClick={addQuestion}>Add Question</button>
      </section>

      <div className="my-4">
        <label>
          Select Exam Name:
          <select
            value={examName}
            onChange={handleExamNameChange}
            className="border-2 p-2 rounded-xl"
          >
            <option value="">Select an exam</option>
            {examOptions.map(exam => (
              <option key={exam.examName} value={exam.examName}>
                {exam.examName}
              </option>
            ))}
          </select>
        </label>
      </div>

      <section className='flex flex-col flex-wrap w-[90%] mx-auto'>
        {questions.length === 0 && examName ? (
          <p>No questions available for the selected exam. You can add new questions below.</p>
        ) : (
          questions.map((question) => (
            <section key={question.id} className='my-4'>
              <div className='flex flex-row justify-between text-center my-2'>
                <h3 className='font-bold my-auto'>Question {question.id}</h3>
                <input
                  type="text"
                  className='w-[75%] m-1 p-2 bg-sky-500/10 rounded-xl border-4'
                  placeholder="Enter question text"
                  value={question.text}
                  onChange={(e) => updateQuestionText(question.id, e.target.value)}
                />
                <label className='my-auto border-2 p-1 rounded-full'>
                  Question Type:
                  <select
                    value={question.type}
                    onChange={(e) => updateQuestionType(question.id, e.target.value)}
                    className='my-auto mx-auto font-bold w-1/2 hover:translate-y-0.5 transition-all'
                  >
                    <option value="MCQ">MCQ</option>
                    <option value="Theory">Theory</option>
                  </select>
                </label>
              </div>

              <div className='my-4 flex justify-between'>
                <label className='my-auto border-2 p-2 rounded-full text-center'>
                  Difficulty Level:
                  <select
                    value={question.difficulty}
                    onChange={(e) => updateQuestionDifficulty(question.id, e.target.value)}
                    className={`my-auto mx-auto font-bold w-1/2 ${question.difficulty === 'Easy' ? 'text-green-600' : question.difficulty === 'Medium' ? 'text-yellow-600' : 'text-red-600'}`}
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </label>
                <label className='my-auto border-2 p-2 rounded-full text-center'>
                  Marks:
                  <input
                    type="number"
                    value={question.marks}
                    onChange={(e) => updateQuestionMarks(question.id, e.target.value)}
                    min="0"
                    className='border rounded-md p-1 mx-2'
                  />
                </label>
              </div>

              <label className='my-auto border-2 p-2 rounded-full text-center'>
                Subject:
                <select
                  value={question.subject}
                  onChange={(e) => updateQuestionSubject(question.id, e.target.value)}
                  className='my-auto mx-auto font-bold w-1/2'
                >
                  <option value="">Select a subject</option>
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </label>

              <div className='flex flex-col'>
                {question.type === 'MCQ' ? (
                  <div>
                    {question.options.map((option, index) => (
                      <div key={index} className='flex items-center my-2'>
                        <CustomRadioButton
                          id={`question-${question.id}-option-${index}`}
                          checked={question.correctAnswer === index}
                          onChange={() => updateCorrectAnswer(question.id, index)}
                          value={option}
                        >
                          <input
                            type="text"
                            className='w-full m-1 p-2 border rounded-md'
                            placeholder={`Option ${index + 1}`}
                            value={option}
                            onChange={(e) => updateOptionText(question.id, index, e.target.value)}
                          />
                        </CustomRadioButton>
                      </div>
                    ))}
                  </div>
                ) : (
                  <textarea
                    className='w-full border rounded-md p-2'
                    placeholder="Enter your answer"
                    value={question.answerText}
                    onChange={(e) => updateTheoryAnswerText(question.id, e.target.value)}
                  />
                )}
              </div>
            </section>
          ))
        )}
      </section>

      <div className='text-center my-4'>
        <button onClick={submitExamQuestions} className='button'>Submit Exam Questions</button>
      </div>
    </div>
  );
}

export default ExamBuilder;