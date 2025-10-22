
import React, { useState, useRef } from 'react';
import { extractInfoFromDocument, checkDocumentQuality } from '../../services/geminiService';
import { ExtractedDocInfo, DocumentCheckResult, DocumentCheckFinding