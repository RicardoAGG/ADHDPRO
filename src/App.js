import React, { useState, useRef, useEffect } from 'react';
import { PlusCircle, CheckCircle, Trash2, Camera, Download, Upload, Moon, Sun } from 'lucide-react';

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [ideas, setIdeas] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [activeTab, setActiveTab] = useState('tasks');
  const [showCompleted, setShowCompleted] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const fileInputRef = useRef(null);

  // Load data from localStorage on initial render
  useEffect(() => {
    const storedTasks = localStorage.getItem('tasks');
    const storedIdeas = localStorage.getItem('ideas');
    const storedRoutines = localStorage.getItem('routines');
    const storedDarkMode = localStorage.getItem('darkMode');

    if (storedTasks) setTasks(JSON.parse(storedTasks));
    if (storedIdeas) setIdeas(JSON.parse(storedIdeas));
    if (storedRoutines) setRoutines(JSON.parse(storedRoutines));
    if (storedDarkMode) setDarkMode(JSON.parse(storedDarkMode));
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('ideas', JSON.stringify(ideas));
    localStorage.setItem('routines', JSON.stringify(routines));
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [tasks, ideas, routines, darkMode]);

  useEffect(() => {
    const now = new Date();
    const today = now.toDateString();
    
    setRoutines(prevRoutines => 
      prevRoutines.map(routine => {
        if (routine.frequency === 'daily' && routine.lastCompletedDate !== today) {
          return { ...routine, done: false, lastCompletedDate: null };
        }
        if (routine.frequency === 'weekly' && now.getDay() === 0 && routine.lastCompletedDate !== today) {
          return { ...routine, done: false, lastCompletedDate: null };
        }
        if (routine.frequency === 'monthly' && now.getDate() === 1 && routine.lastCompletedDate !== today) {
          return { ...routine, done: false, lastCompletedDate: null };
        }
        return routine;
      })
    );
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.style.backgroundColor = !darkMode ? '#1a1a1a' : 'white';
    document.body.style.color = !darkMode ? 'white' : 'black';
  };

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('text/plain', index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    let items;
    switch(activeTab) {
      case 'tasks': items = [...tasks]; break;
      case 'ideas': items = [...ideas]; break;
      case 'routines': items = [...routines]; break;
      default: return;
    }
    const [reorderedItem] = items.splice(sourceIndex, 1);
    items.splice(targetIndex, 0, reorderedItem);
    switch(activeTab) {
      case 'tasks': setTasks(items); break;
      case 'ideas': setIdeas(items); break;
      case 'routines': setRoutines(items); break;
      default: break;
    }
  };

  const completeTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completedAt: new Date() } : task
    ));
  };

  const updateRoutine = (id, updates) => {
    const today = new Date().toDateString();
    setRoutines(routines.map(routine => 
      routine.id === id ? { 
        ...routine, 
        ...updates,
        streak: updates.done && routine.lastCompletedDate !== today ? routine.streak + 1 : routine.streak,
        lastCompletedDate: updates.done ? today : routine.lastCompletedDate
      } : routine
    ));
  };

  const deleteItem = (type, id) => {
    switch(type) {
      case 'tasks': setTasks(tasks.filter(task => task.id !== id)); break;
      case 'ideas': setIdeas(ideas.filter(idea => idea.id !== id)); break;
      case 'routines': setRoutines(routines.filter(routine => routine.id !== id)); break;
      default: break;
    }
  };

  const addItem = (type, content, imageData = null) => {
    const newItem = { 
      id: Date.now(), 
      content, 
      createdAt: new Date(),
      image: imageData ? imageData.full : null,
      thumbnail: imageData ? imageData.thumbnail : null,
      streak: 0,
      lastCompletedDate: null
    };
    switch(type) {
      case 'tasks': setTasks([...tasks, { ...newItem, completedAt: null }]); break;
      case 'ideas': setIdeas([...ideas, newItem]); break;
      case 'routines': setRoutines([...routines, { ...newItem, frequency: 'daily', done: false }]); break;
      default: break;
    }
  };

  const exportData = () => {
    const data = JSON.stringify({ tasks, ideas, routines });
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'adhd_organizer_data.json';
    link.click();
  };

  const handleImageCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Here we would normally generate a thumbnail
        // For simplicity, we're using the same image for both full and thumbnail
        addItem(activeTab, `Image: ${file.name}`, { full: reader.result, thumbnail: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          setTasks(data.tasks || []);
          setIdeas(data.ideas || []);
          setRoutines(data.routines || []);
        } catch (error) {
          console.error('Error importing data:', error);
          alert('Error importing data. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const getStyles = (darkMode) => ({
    fullPageContainer: {
      minHeight: '100vh',
      backgroundColor: darkMode ? '#1a1a1a' : '#f5f5f5',
      color: darkMode ? 'white' : '#333',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    container: {
      maxWidth: '900px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: darkMode ? '#333' : 'white',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      borderRadius: '8px',
    },
    header: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: '20px',
      color: darkMode ? 'white' : '#007bff',
    },
    tabContainer: {
      display: 'flex',
      justifyContent: 'space-around',
      marginBottom: '20px',
    },
    tab: {
      flex: 1,
      padding: '15px',
      border: 'none',
      backgroundColor: darkMode ? '#444' : '#e0e0e0',
      color: darkMode ? 'white' : '#333',
      cursor: 'pointer',
      transition: 'background-color 0.3s, color 0.3s',
      borderRadius: '8px',
      margin: '0 5px',
      textAlign: 'center',
    },
    activeTab: {
      backgroundColor: '#007bff',
      color: 'white',
    },
    input: {
      width: 'calc(100% - 60px)',
      padding: '10px',
      fontSize: '1rem',
      border: '1px solid #ccc',
      borderRadius: '8px 0 0 8px',
      backgroundColor: darkMode ? '#555' : 'white',
      color: darkMode ? 'white' : '#333',
      marginRight: '-1px',
    },
    addButton: {
      width: '60px',
      padding: '10px',
      fontSize: '1.5rem',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '0 8px 8px 0',
      cursor: 'pointer',
    },
    buttonContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: '20px',
    },
    button: {
      padding: '10px 20px',
      fontSize: '1rem',
      backgroundColor: '#28a745',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'background-color 0.3s',
    },
    item: {
      backgroundColor: darkMode ? '#444' : 'white',
      border: `1px solid ${darkMode ? '#555' : '#ddd'}`,
      borderRadius: '8px',
      padding: '15px',
      marginBottom: '10px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      transition: 'background-color 0.3s, border 0.3s',
    },
    itemCompleted: {
      opacity: 0.6,
    },
  });

  const styles = getStyles(darkMode);

  const TaskItem = ({ task, completeTask, deleteTask }) => (
    <div style={styles.item}>
      {task.thumbnail && (
        <a href={task.image} target="_blank" rel="noopener noreferrer">
          <img src={task.thumbnail} alt="Task thumbnail" style={{ width: '50px', height: '50px', marginRight: '10px', borderRadius: '4px' }} />
        </a>
      )}
      <span>{task.content}</span>
      <div>
        {!task.completedAt && (
          <button 
            onClick={() => completeTask(task.id)}
            style={{ ...styles.button, marginRight: '5px', backgroundColor: '#28a745' }}
          >
            <CheckCircle size={18} />
          </button>
        )}
        <button 
          onClick={() => deleteTask(task.id)}
          style={{ ...styles.button, backgroundColor: '#dc3545' }}
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );

  const Routine = ({ routine, updateRoutine, deleteRoutine }) => (
    <div style={styles.item}>
      <input
        type="checkbox"
        checked={routine.done}
        onChange={() => updateRoutine(routine.id, { done: !routine.done })}
        style={{ marginRight: '10px' }}
      />
      <span style={routine.done ? { textDecoration: 'line-through' } : {}}>
        {routine.content} (Streak: {routine.streak})
      </span>
      <select
        value={routine.frequency}
        onChange={(e) => updateRoutine(routine.id, { frequency: e.target.value })}
        style={{ marginLeft: '10px', marginRight: '10px' }}
      >
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
      </select>
      <button onClick={() => deleteRoutine(routine.id)} style={styles.button}>
        <Trash2 size={18} />
      </button>
    </div>
  );

  const renderList = (items, type) => {
    if (type === 'routines') {
      const dailyRoutines = items.filter(item => item.frequency === 'daily');
      const weeklyRoutines = items.filter(item => item.frequency === 'weekly');
      const monthlyRoutines = items.filter(item => item.frequency === 'monthly');
      
      return (
        <div>
          <h3>Daily</h3>
          {dailyRoutines.map(routine => (
            <Routine
              key={routine.id}
              routine={routine}
              updateRoutine={updateRoutine}
              deleteRoutine={(id) => deleteItem('routines', id)}
            />
          ))}
          <h3>Weekly</h3>
          {weeklyRoutines.map(routine => (
            <Routine
              key={routine.id}
              routine={routine}
              updateRoutine={updateRoutine}
              deleteRoutine={(id) => deleteItem('routines', id)}
            />
          ))}
          <h3>Monthly</h3>
          {monthlyRoutines.map(routine => (
            <Routine
              key={routine.id}
              routine={routine}
              updateRoutine={updateRoutine}
              deleteRoutine={(id) => deleteItem('routines', id)}
            />
          ))}
        </div>
      );
    }

    return (
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {items.map((item, index) => (
          <li 
            key={item.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            style={{
              ...styles.item,
              ...(type === 'tasks' && item.completedAt ? styles.itemCompleted : {})
            }}
          >
            {type === 'tasks' ? (
              <TaskItem
                task={item}
                completeTask={completeTask}
                deleteTask={(id) => deleteItem('tasks', id)}
              />
            ) : (
              <>
                <span>{item.content}</span>
                <button 
                  onClick={() => deleteItem(type, item.id)}
                  style={{ ...styles.button, backgroundColor: '#dc3545' }}
                >
                  <Trash2 size={18} />
                </button>
                </>
            )}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div style={styles.fullPageContainer}>
      <div style={styles.container}>
        <button
          onClick={toggleDarkMode}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: darkMode ? 'white' : 'black',
          }}
        >
          {darkMode ? <Sun size={24} /> : <Moon size={24} />}
        </button>
        <h1 style={styles.header}>ADHD Organizer</h1>
        
        <div style={styles.tabContainer}>
          {['tasks', 'ideas', 'routines'].map((tab) => (
            <button 
              key={tab}
              style={{
                ...styles.tab,
                ...(activeTab === tab ? styles.activeTab : {})
              }}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div>
          <input 
            type="text" 
            style={styles.input}
            placeholder={`Add a new ${activeTab.slice(0, -1)}...`}
            onKeyPress={(e) => e.key === 'Enter' && addItem(activeTab, e.target.value)}
          />
          <button 
            style={styles.addButton}
            onClick={() => {
              const input = document.querySelector('input');
              addItem(activeTab, input.value);
              input.value = '';
            }}
          >
            <PlusCircle size={24} />
          </button>
        </div>

        <div style={styles.buttonContainer}>
          {activeTab !== 'routines' && (
            <button 
              style={{ ...styles.button, backgroundColor: '#6f42c1' }}
              onClick={() => fileInputRef.current.click()}
            >
              <Camera size={18} />
              Capture
            </button>
          )}
          <div>
            <button 
              style={{ ...styles.button, marginRight: '5px' }}
              onClick={exportData}
            >
              <Download size={18} />
              Export
            </button>
            <button 
              style={{ ...styles.button, backgroundColor: '#ffc107', color: '#000' }}
              onClick={() => document.getElementById('import-input').click()}
            >
              <Upload size={18} />
              Import
            </button>
          </div>
        </div>

        <div style={{ marginTop: '20px' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </h2>
          {activeTab === 'tasks' && (
            <button 
              style={{ ...styles.button, backgroundColor: '#17a2b8', marginBottom: '10px' }}
              onClick={() => setShowCompleted(!showCompleted)}
            >
              {showCompleted ? 'Hide Completed' : 'Show Completed'}
            </button>
          )}
          {activeTab === 'tasks' && renderList(tasks.filter(task => showCompleted ? true : !task.completedAt), 'tasks')}
          {activeTab === 'ideas' && renderList(ideas, 'ideas')}
          {activeTab === 'routines' && (
            <>
              <div style={{ marginBottom: '10px' }}>
                <h3>Total Streak: {routines.reduce((total, routine) => total + routine.streak, 0)}</h3>
              </div>
              {renderList(routines, 'routines')}
            </>
          )}
        </div>

        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          accept="image/*" 
          capture="environment"
          onChange={handleImageCapture}
        />
        <input
          id="import-input"
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={importData}
        />
      </div>
    </div>
  );
};

export default App;