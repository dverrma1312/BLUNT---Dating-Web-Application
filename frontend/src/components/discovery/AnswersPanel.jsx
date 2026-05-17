import { useState } from 'react';
import { getPhotoUrl } from './utils';

function AnswersPanel({
  matchId,
  otherUser,
  inlineQuestions,
  inlineMyQuestions,
  inlineAnswers,
  inlineChatUnlocked,
  mySubmittedAnswerIds,
  inlineAnswerInputs,
  setInlineAnswerInputs,
  answerLoading,
  setActiveView,
  setShowRemoveModal,
  handleInlineAnswer,
}) {
  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      zIndex: 5,
      position: 'relative',
      backgroundColor: '#080808',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px',
        borderBottom: '1px solid #1A1A1A'
      }}>
        <button
          style={{
            background: 'none',
            border: 'none',
            color: '#444',
            fontSize: '12px',
            cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif"
          }}
          onClick={() => setActiveView(null)}
        >
          ← back
        </button>
        <button
          style={{
            background: 'none',
            border: '1px solid #333',
            color: '#666',
            fontSize: '11px',
            padding: '6px 12px',
            cursor: 'pointer',
            borderRadius: '2px',
            fontFamily: "'DM Sans', sans-serif"
          }}
          onClick={() => setShowRemoveModal(true)}
        >
          reject
        </button>
      </div>

      {/* Chat Unlocked Banner */}
      {inlineChatUnlocked && (
        <div
          style={{
            backgroundColor: '#1A1A1A',
            color: '#F5F5F5',
            border: '1px solid #2A2A2A',
            padding: '12px 16px',
            borderRadius: '2px',
            fontSize: '13px',
            fontFamily: "'DM Sans', sans-serif",
            cursor: 'pointer',
            margin: '16px 32px',
            textAlign: 'center',
            letterSpacing: '0.05em',
          }}
          onClick={() => setActiveView({ type: 'chat', matchId, otherUser })}
        >
          chat unlocked — go to chat →
        </div>
      )}

      {/* Scrollable Content */}
      <div style={{
        overflowY: 'auto',
        flex: 1,
        padding: '0 32px 40px',
      }}>
        {/* Their Questions */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{
            color: '#333',
            fontSize: '10px',
            letterSpacing: '0.2em',
            fontFamily: "'DM Sans', sans-serif",
            textTransform: 'uppercase',
            marginBottom: '16px',
            marginTop: '32px',
          }}>their questions</h3>
          {inlineQuestions.map((q, idx) => {
            const myAnswer = Array.isArray(inlineAnswers) ? inlineAnswers.find(a => a.question === q.id) : null;
            const wasJustSubmitted = mySubmittedAnswerIds.has(q.id);
            return (
              <div key={q.id || idx} style={{
                backgroundColor: '#0D0D0D',
                border: '1px solid #1A1A1A',
                borderRadius: '2px',
                padding: '20px 24px',
                marginBottom: '8px',
              }}>
                <span style={{
                  color: '#FFFFFF',
                  fontSize: '9px',
                  fontFamily: "'DM Sans', sans-serif",
                  letterSpacing: '0.2em',
                  fontWeight: 600,
                  display: 'block',
                  marginBottom: '12px',
                }}>{String(idx + 1).padStart(2, '0')}</span>
                <span style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontStyle: 'italic',
                  fontSize: '17px',
                  color: '#F5F5F5',
                  lineHeight: 1.5,
                  fontWeight: 400,
                  display: 'block',
                }}>{q.text || q.question}</span>
                {myAnswer || wasJustSubmitted ? (
                  <>
                    <span style={{
                      color: '#00D26A',
                      fontSize: '11px',
                      fontFamily: "'DM Sans', sans-serif",
                      letterSpacing: '0.1em',
                      marginTop: '10px',
                      display: 'block'
                    }}>✓ submitted</span>
                    <span style={{
                      display: 'block',
                      marginTop: '8px',
                      paddingLeft: '12px',
                      borderLeft: '2px solid #1E1E1E',
                      color: '#555',
                      fontSize: '13px',
                      fontFamily: "'DM Serif Display', serif",
                      fontStyle: 'italic',
                    }}>{myAnswer?.answer || inlineAnswerInputs[q.id]}</span>
                  </>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                    <input
                      type="text"
                      placeholder="your answer..."
                      value={inlineAnswerInputs[q.id] || ''}
                      onChange={e => setInlineAnswerInputs(prev => ({ ...prev, [q.id]: e.target.value }))}
                      style={{
                        width: '100%',
                        backgroundColor: '#0D0D0D',
                        border: '1px solid #2A2A2A',
                        borderRadius: '2px',
                        padding: '12px 14px',
                        color: '#F5F5F5',
                        fontSize: '14px',
                        fontFamily: "'DM Sans', sans-serif",
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                    <button
                      onClick={() => handleInlineAnswer(q.id)}
                      disabled={answerLoading}
                      style={{
                        width: 'auto',
                        alignSelf: 'flex-end',
                        padding: '8px 20px',
                        fontSize: '11px',
                      }}
                    >
                      submit →
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* My Questions */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{
            color: '#333',
            fontSize: '10px',
            letterSpacing: '0.2em',
            fontFamily: "'DM Sans', sans-serif",
            textTransform: 'uppercase',
            marginBottom: '16px',
            marginTop: '32px',
          }}>your questions</h3>
          {inlineMyQuestions.length === 0 ? (
            <p style={{
              color: '#333',
              fontSize: '12px',
              fontStyle: 'italic',
              fontFamily: "'DM Sans', sans-serif"
            }}>
              you haven't set any questions yet
            </p>
          ) : (
            inlineMyQuestions.map((q, idx) => (
              <div key={q.id || idx} style={{
                backgroundColor: '#0D0D0D',
                border: '1px solid #141414',
                borderRadius: '2px',
                padding: '20px 24px',
                marginBottom: '8px',
                opacity: 0.5,
              }}>
                <span style={{
                  color: '#FFFFFF',
                  fontSize: '9px',
                  fontFamily: "'DM Sans', sans-serif",
                  letterSpacing: '0.2em',
                  fontWeight: 600,
                  display: 'block',
                  marginBottom: '12px',
                }}>{String(idx + 1).padStart(2, '0')}</span>
                <span style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontStyle: 'italic',
                  fontSize: '17px',
                  color: '#F5F5F5',
                  lineHeight: 1.5,
                  fontWeight: 400,
                  display: 'block',
                }}>{q.text || q.question}</span>
                {Array.isArray(inlineAnswers) && inlineAnswers.some(a => a.question === q.id) ? (
                  <span style={{
                    color: '#00D26A',
                    fontSize: '11px',
                    fontFamily: "'DM Sans', sans-serif",
                    letterSpacing: '0.1em',
                    marginTop: '10px',
                    display: 'block'
                  }}>✓ answered</span>
                ) : (
                  <span style={{
                    color: '#333',
                    fontSize: '11px',
                    fontFamily: "'DM Sans', sans-serif",
                    fontStyle: 'italic',
                    marginTop: '10px',
                    display: 'block'
                  }}>waiting...</span>
                )}
              </div>
            ))
          )}
        </div>

        {/* Their Answers to Your Questions */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{
            color: '#333',
            fontSize: '10px',
            letterSpacing: '0.2em',
            fontFamily: "'DM Sans', sans-serif",
            textTransform: 'uppercase',
            marginBottom: '16px',
            marginTop: '32px',
          }}>their answers to your questions</h3>
          {(() => {
            const myQuestionIds = inlineMyQuestions.map(q => q.id || q);
            const theirAnswersToMyQ = (Array.isArray(inlineAnswers) ? inlineAnswers : []).filter(a =>
              myQuestionIds.includes(a.question) &&
              !mySubmittedAnswerIds.has(a.question)
            );
            if (theirAnswersToMyQ.length === 0 && inlineMyQuestions.length > 0) {
              return (
                <p style={{
                  color: '#333',
                  fontSize: '12px',
                  fontStyle: 'italic',
                  fontFamily: "'DM Sans', sans-serif"
                }}>
                  waiting for their answers...
                </p>
              );
            }
            return theirAnswersToMyQ.map((a, idx) => {
              const question = inlineMyQuestions.find(q => (q.id || q) === a.question);
              return (
                <div key={idx} style={{
                  backgroundColor: '#0D0D0D',
                  border: '1px solid #1A1A1A',
                  borderRadius: '2px',
                  padding: '20px 24px',
                  marginBottom: '16px',
                  position: 'relative',
                }}>
                  <span style={{
                    fontSize: '10px',
                    color: '#444',
                    fontFamily: "'DM Sans', sans-serif",
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                  }}>
                    {question?.text || question?.question || 'your question'}
                  </span>
                  <span style={{
                    fontFamily: "'DM Serif Display', serif",
                    fontStyle: 'italic',
                    fontSize: '17px',
                    color: '#F5F5F5',
                    marginTop: '8px',
                    display: 'block'
                  }}>
                    {a.answer}
                  </span>
                </div>
              );
            });
          })()}
        </div>
      </div>
    </div>
  );
}

export default AnswersPanel;