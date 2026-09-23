import { ExamSample } from '../types';

export const EXAM_SAMPLES: ExamSample[] = [
  {
    id: 'bst-cpp',
    title: 'BST Insertion (C++)',
    course: 'CS 106B - Data Structures',
    handwrittenTitle: 'Question 3: Binary Search Tree Insertion',
    problemDescription: `Problem Statement:
Write a C++ function 'insert(TreeNode*& root, int val)' that inserts a new value into a Binary Search Tree while preserving the BST property. If the value already exists, do not duplicate it.

Requirements:
- Proper pointer handling / reference to pointer or returning root.
- Allocate new node dynamically with 'new TreeNode(val)'.
- Correct traversal logic (val < root->val goes left, val > root->val goes right).
- Time Complexity should be O(h) where h is tree height.
- Space Complexity: O(h) recursion or O(1) iterative.`,
    expectedLanguage: 'C++',
    studentCodeLines: [
      '// Student ID: 20491823 - Final Exam',
      'void insert(TreeNode* &root, int val) {',
      '    if (root == nullptr) {',
      '        root = new TreeNode(val);',
      '        return;',
      '    }',
      '    if (val < root->val) {',
      '        insert(root->left, val);',
      '    } else if (val > root->val) {',
      '        insert(root->right, val);',
      '    }',
      '    // if equal, do nothing (no duplicates)',
      '}',
    ],
    scratchedOutLine: '    // delete root; // scratched out by student',
    ambiguityNote: 'Braces written casually, semicolon at return statement appears faint.',
    sampleSummary: 'Clean recursive C++ reference-pointer BST insertion. Correct logic with no duplicates handling.',
  },
  {
    id: 'palindrome-python',
    title: 'Recursive Palindrome (Python)',
    course: 'CS 61A - Structure and Interpretation of Computer Programs',
    handwrittenTitle: 'Problem 2: Recursive Palindrome Check',
    problemDescription: `Problem Statement:
Write a recursive Python function 'is_palindrome(s)' that returns True if string s is a palindrome and False otherwise. Treat case-sensitivity as exact.

Edge cases to handle:
- Empty string "" should return True.
- Single character string should return True.
- Misspelled strings with differing boundary characters should return False early.`,
    expectedLanguage: 'Python',
    studentCodeLines: [
      '# Student Submission - Midterm 1',
      'def is_palindrome(s):',
      '    if len(s) <= 1:',
      '        return True',
      '    if s[0] != s[-1]:',
      '        return False',
      '    return is_palindrome(s[1:-1])',
    ],
    ambiguityNote: 'Colon after def has dot-like appearance, indentation is handwriting style.',
    sampleSummary: 'Python recursive slice approach with base case len(s) <= 1 and ends comparison.',
  },
  {
    id: 'linked-list-java',
    title: 'Reverse Linked List (Java)',
    course: 'CS 132 - Algorithms & Data Structures',
    handwrittenTitle: 'Question 4: In-Place Singly Linked List Reversal',
    problemDescription: `Problem Statement:
Given the head of a singly linked list 'ListNode head', reverse the list in-place and return the new head pointer.

Requirements:
- Time complexity: O(n)
- Auxiliary space complexity: O(1) strictly in-place
- Edge cases: Empty list (head == null) and single-element list.`,
    expectedLanguage: 'Java',
    studentCodeLines: [
      '// Student Exam Paper - Section B',
      'public ListNode reverseList(ListNode head) {',
      '    ListNode prev = null;',
      '    ListNode curr = head;',
      '    while (curr != null) {',
      '        ListNode nextTemp = curr.next;',
      '        curr.next = prev;',
      '        prev = curr;',
      '        curr = nextTemp;',
      '    }',
      '    return prev;',
      '}',
    ],
    scratchedOutLine: '    // curr = curr.next; // student scratched out wrong order',
    ambiguityNote: 'Semicolons look like small slashes, dot in curr.next is faint.',
    sampleSummary: 'Iterative 3-pointer reversal in Java. Optimal O(n) time and O(1) space.',
  },
  {
    id: 'twosum-flawed-js',
    title: 'Two Sum with Logic Bug (JavaScript)',
    course: 'CS 220 - Web Programming & Algorithms',
    handwrittenTitle: 'Exam Question: Two Sum Target Indices',
    problemDescription: `Problem Statement:
Given an array of integers 'nums' and an integer 'target', return indices of the two numbers such that they add up to target. You may not use the same element twice.

Expected:
- Output array of indices [i, j]
- Time complexity O(n) using Hash Map, or O(n^2) nested loop.`,
    expectedLanguage: 'JavaScript',
    studentCodeLines: [
      'function twoSum(nums, target) {',
      '    let map = {};',
      '    for (let i = 0; i < nums.length; i++) {',
      '        let complement = target - nums[i];',
      '        if (map[complement]) { // BUG: what if index is 0? falsy check!',
      '            return [map[complement], i];',
      '        }',
      '        map[nums[i]] = i;',
      '    }',
      '    return [];',
      '}',
    ],
    ambiguityNote: 'Curly bracket at end is scratched, index 0 falsy edge case present in code.',
    sampleSummary: 'JS Hash Map approach with classic index 0 falsy condition bug: if (map[complement]) fails when value is at index 0.',
  },
];

/**
 * Renders an authentic academic exam sheet onto a HTML Canvas and returns data URL
 */
export function renderExamSheetToCanvas(sample: ExamSample): string {
  const canvas = document.createElement('canvas');
  canvas.width = 900;
  canvas.height = 1100;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background - Off-white / ivory exam booklet paper
  ctx.fillStyle = '#fdfbf7';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle paper grain & vintage edge shadow
  ctx.strokeStyle = '#e2ded5';
  ctx.lineWidth = 1;
  ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

  // Blue notebook ruled lines
  const lineHeight = 36;
  const startY = 160;
  ctx.strokeStyle = '#d4e3f5';
  ctx.lineWidth = 1.2;

  for (let y = startY; y < canvas.height - 50; y += lineHeight) {
    ctx.beginPath();
    ctx.moveTo(30, y);
    ctx.lineTo(canvas.width - 30, y);
    ctx.stroke();
  }

  // Red left margin line (classic lined exam paper)
  const marginX = 130;
  ctx.strokeStyle = '#fca5a5';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(marginX, 30);
  ctx.lineTo(marginX, canvas.height - 30);
  ctx.stroke();

  // Printed exam header (black/grey standard serif/sans)
  ctx.fillStyle = '#334155';
  ctx.font = 'bold 15px "Inter", sans-serif';
  ctx.fillText(`DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING`, 140, 50);

  ctx.font = '13px "Inter", sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText(`Course: ${sample.course}   |   Examination Answer Booklet   |   Max Marks: 100`, 140, 72);

  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(140, 85);
  ctx.lineTo(canvas.width - 40, 85);
  ctx.stroke();

  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 16px "Inter", sans-serif';
  ctx.fillText(sample.handwrittenTitle, 140, 115);

  // Handwritten section by student (using Kalam / cursive style with slight angle & jitter)
  ctx.save();
  ctx.fillStyle = '#1e1b4b'; // dark blue ballpoint pen ink
  ctx.font = '22px "Kalam", cursive, sans-serif';

  let currentY = startY + 28;

  // Question number in margin
  ctx.fillStyle = '#2563eb';
  ctx.font = 'bold 20px "Kalam", cursive, sans-serif';
  ctx.fillText('Ans:', 75, currentY);

  ctx.fillStyle = '#1e293b';
  ctx.font = '22px "Kalam", cursive, sans-serif';

  sample.studentCodeLines.forEach((line, index) => {
    // slight natural tilt & pen jitter
    const jitterX = (Math.sin(index * 1.5) * 1.5);
    const indentMatch = line.match(/^(\s+)/);
    const indentSpaces = indentMatch ? indentMatch[1].length : 0;
    const xPos = marginX + 15 + (indentSpaces * 14) + jitterX;

    // Optional scratched-out line simulation
    if (index === 4 && sample.scratchedOutLine) {
      ctx.save();
      ctx.fillStyle = '#475569';
      ctx.fillText(sample.scratchedOutLine.trim(), marginX + 15, currentY);
      // scratch line
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(marginX + 10, currentY - 6);
      ctx.lineTo(marginX + 380, currentY - 8);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(marginX + 15, currentY - 3);
      ctx.lineTo(marginX + 370, currentY - 5);
      ctx.stroke();
      ctx.restore();
      currentY += lineHeight;
    }

    ctx.fillText(line.trim(), xPos, currentY);
    currentY += lineHeight;
  });

  // Stamp / Teacher rubric box placeholder in margin
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.strokeRect(canvas.width - 200, 35, 160, 48);
  ctx.setLineDash([]);
  ctx.font = '10px "Inter", sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('EXAMINER EVALUATION', canvas.width - 190, 52);
  ctx.fillText('SCORE: [     / 100 ]', canvas.width - 190, 70);

  ctx.restore();

  return canvas.toDataURL('image/png');
}
