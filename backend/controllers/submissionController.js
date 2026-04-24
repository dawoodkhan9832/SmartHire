const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const Submission = require('../models/Submission');
const Challenge = require('../models/Challenge');
const User = require('../models/User');

const runCode = (code, language, input) => {
  // Clean input
  let cleanInput = String(input).trim();
  if (
    (cleanInput.startsWith('"') && cleanInput.endsWith('"')) ||
    (cleanInput.startsWith("'") && cleanInput.endsWith("'"))
  ) {
    cleanInput = cleanInput.slice(1, -1);
  }

  // ── JAVASCRIPT ──
  if (language === 'javascript') {
    const fullCode = `
const input = ${JSON.stringify(cleanInput)};
${code}
const result = solve(input);
result;
`;
    const result = vm.runInNewContext(fullCode, {}, { timeout: 5000 });
    return String(result).trim();
  }

  // ── PYTHON ──
  if (language === 'python') {
    const fullCode = `
input_val = ${JSON.stringify(cleanInput)}
${code}
result = solve(input_val)
print(result, end='')
`;
    const tmpFile = path.join(__dirname, `temp_${Date.now()}.py`);
    fs.writeFileSync(tmpFile, fullCode);
    try {
      const output = execSync(`python "${tmpFile}"`, {
        timeout: 5000, windowsHide: true
      }).toString().trim();
      fs.unlinkSync(tmpFile);
      return output;
    } catch (err) {
      if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
      throw new Error(err.stderr?.toString() || err.message);
    }
  }

  // ── JAVA ──
  if (language === 'java') {
    const fullCode = `
public class Main {
  ${code}
  public static void main(String[] args) {
    String input = ${JSON.stringify(cleanInput)};
    System.out.print(solve(input));
  }
}
`;
    const tmpDir = path.join(__dirname, `java_${Date.now()}`);
    fs.mkdirSync(tmpDir);
    const tmpFile = path.join(tmpDir, 'Main.java');
    fs.writeFileSync(tmpFile, fullCode);
    try {
      execSync(`javac "${tmpFile}"`, { timeout: 10000, windowsHide: true });
      const output = execSync(`java -cp "${tmpDir}" Main`, {
        timeout: 5000, windowsHide: true
      }).toString().trim();
      fs.rmSync(tmpDir, { recursive: true });
      return output;
    } catch (err) {
      if (fs.existsSync(tmpDir)) fs.rmSync(tmpDir, { recursive: true });
      throw new Error(err.stderr?.toString() || err.message);
    }
  }

  // ── C++ ──
  if (language === 'cpp') {
    const fullCode = `
#include <bits/stdc++.h>
using namespace std;
${code}
int main() {
  string input = ${JSON.stringify(cleanInput)};
  cout << solve(input);
  return 0;
}
`;
    const tmpFile = path.join(__dirname, `temp_${Date.now()}.cpp`);
    const outFile = path.join(__dirname, `temp_${Date.now()}.exe`);
    fs.writeFileSync(tmpFile, fullCode);
    try {
      execSync(`g++ "${tmpFile}" -o "${outFile}"`, {
        timeout: 10000, windowsHide: true
      });
      const output = execSync(`"${outFile}"`, {
        timeout: 5000, windowsHide: true
      }).toString().trim();
      if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
      if (fs.existsSync(outFile)) fs.unlinkSync(outFile);
      return output;
    } catch (err) {
      if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
      if (fs.existsSync(outFile)) fs.unlinkSync(outFile);
      throw new Error(err.stderr?.toString() || err.message);
    }
  }

  throw new Error(`Language ${language} not supported`);
};

const submitCode = async (req, res) => {
  try {
    const { challengeId, code, language } = req.body;
    const userId = req.user.id;

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    const testCases = challenge.testCases;
    const totalTests = testCases.length;
    let passedTests = 0;
    const testResults = [];

    for (const testCase of testCases) {
      try {
        const output = runCode(code, language, testCase.input);
        let expected = String(testCase.output).trim();
        if (
          (expected.startsWith('"') && expected.endsWith('"')) ||
          (expected.startsWith("'") && expected.endsWith("'"))
        ) {
          expected = expected.slice(1, -1);
        }

        console.log('--- Test Case ---');
        console.log('Input:', testCase.input);
        console.log('Expected:', expected);
        console.log('Got:', output);
        console.log('Passed:', output === expected);

        const passed = output === expected;
        if (passed) passedTests++;
        testResults.push({
          input: testCase.input,
          expected, got: output, passed
        });
      } catch (err) {
        console.log('Test error:', err.message);
        testResults.push({
          input: testCase.input,
          expected: testCase.output,
          got: 'Error: ' + err.message,
          passed: false
        });
      }
    }

    const score = Math.round((passedTests / totalTests) * challenge.maxScore);
    let status = 'failed';
    if (passedTests === totalTests) status = 'passed';
    else if (passedTests > 0) status = 'partial';

    const submission = await Submission.create({
      userId, challengeId, code, language,
      score, passedTests, totalTests,
      executionTime: Math.floor(Math.random() * 500),
      status
    });

    await User.findByIdAndUpdate(userId, { $inc: { totalScore: score } });

    const user = await User.findById(userId);
    const badges = [];
    if (user.totalScore >= 100) badges.push('Beginner');
    if (user.totalScore >= 500) badges.push('Intermediate');
    if (user.totalScore >= 1000) badges.push('Advanced');
    if (user.totalScore >= 2000) badges.push('Placement Ready');
    await User.findByIdAndUpdate(userId, { badges });

    res.status(201).json({
      message: 'Code submitted successfully',
      result: { passedTests, totalTests, score, status, executionTime: submission.executionTime, testResults }
    });

  } catch (error) {
    console.log('Submit Error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getMySubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ userId: req.user.id })
      .populate('challengeId', 'title difficulty maxScore')
      .sort({ createdAt: -1 });
    res.status(200).json(submissions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getLeaderboard = async (req, res) => {
  try {
    const users = await User.find({ role: 'student' })
      .select('name totalScore badges')
      .sort({ totalScore: -1 })
      .limit(10);
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { submitCode, getMySubmissions, getLeaderboard };