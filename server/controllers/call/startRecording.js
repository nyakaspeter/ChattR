export const startRecording = async (req, res) => {
  const roomId = req.params.roomId;

  try {
    // const recording = await ovClient.startRecording(session.sessionId);
    // // TODO: Signal to room that recording has started
    // res.status(200).json(recording);
  } catch (err) {
    console.error(err);
    res.status(409).json({ message: err.message });
  }
};
