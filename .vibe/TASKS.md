<prep>
✅ TESTING PLAN CREATED (2025-08-10)

Comprehensive testing documentation has been created covering all OpenAI agent permutations:

📁 Testing Documentation:
- `/docs/testing-plan.md` - Full testing plan with 150+ test cases
- `/docs/testing-checklist.md` - Quick reference checklist with priority matrix
- `/docs/test-data.md` - Specific test prompts and expected outcomes

Testing Coverage:
- 6 Agent Modes (Text, Vision, Create, Transcribe, Speak, Code)
- 6 Input Types (text, image, audio, file, drawing, clipboard)
- 7 Output Types (chat, audio, image, code, table, chart, file)
- 30+ core permutation tests
- 50+ edge case tests
- 20+ platform-specific tests

Ready to execute testing and file bugs individually.
</prep>

<bugs>

</bugs>



<resolved>
- The swiping behaviour for the inputs, and each of the options for the agents should be the same. should be the same ux, same approach, we need to split these all out into their own cards please. We will be going card by card to check each one is working. Take your time to fix this its important to get this right. 
- When a user swipes the agents, the options available for input and output should filter, based on what inputs and outputs a card expects. For instance, a chat input and text output will both take an input as text (for output card), as well as output text from our input card. For the other modalities, we will need to filter this appropriately, based on what different inputs are avilable.