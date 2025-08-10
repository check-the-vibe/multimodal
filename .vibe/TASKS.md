<bugs>
Output Card: On push of data to code and table expand in size as an agent is 'thinking'.

TEXT-06: Send button does not work on clipboard input
VISION-01: 404 when pressing "analyze" button in image input card. 


</bugs>



<resolved>
- The swiping behaviour for the inputs, and each of the options for the agents should be the same. should be the same ux, same approach, we need to split these all out into their own cards please. We will be going card by card to check each one is working. Take your time to fix this its important to get this right. 
- When a user swipes the agents, the options available for input and output should filter, based on what inputs and outputs a card expects. For instance, a chat input and text output will both take an input as text (for output card), as well as output text from our input card. For the other modalities, we will need to filter this appropriately, based on what different inputs are avilable.