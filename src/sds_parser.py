import pdfplumber
import re



class SDSParser:
    def __init__(self, pdf_path):
        self.pdf_path = pdf_path
        self.sections = {
            'SECTION 1': 'IDENTIFICATION',
            'SECTION 2': 'HAZARDS IDENTIFICATION',
            'SECTION 3': 'COMPOSITION/INFORMATION ON INGREDIENTS',
            'SECTION 9': 'PHYSICAL AND CHEMICAL PROPERTIES',
            'SECTION 10': 'STABILITY AND REACTIVITY',
            'SECTION 13': 'DISPOSAL CONSIDERATIONS',
            'SECTION 14': 'TRANSPORT INFORMATION'
        }
    
    def extract_sections(self):
        extracted_data = {}
        
        with pdfplumber.open(self.pdf_path) as pdf:
            full_text = ''
            for page in pdf.pages:
                full_text += page.extract_text() + '\n'

            sections_split = re.split(r'(?i)(?=SECTION \d+[.:]+)', full_text)
            
            for section_text in sections_split:
                for section_num, section_name in self.sections.items():
                    pattern = rf"{section_num}[.:]\s*{section_name}"
                    if re.search(pattern, section_text, re.IGNORECASE):
                        content = re.sub(pattern, '', section_text, flags=re.IGNORECASE)
                        content = self._clean_content(content)
                        extracted_data[f"{section_num}"] = content
                        break
        
        return extracted_data

    def _clean_content(self, content):
        lines = [line.strip() for line in content.split('\n') if line.strip()]
        cleaned_lines = []
        for line in lines:
            if re.match(r'SECTION \d+', line, re.IGNORECASE):
                break
            cleaned_lines.append(line)
        return '\n'.join(cleaned_lines)

    def format_output(self, extracted_data):
        formatted_output = "SAFETY DATA SHEET - EXTRACTED SECTIONS\n" + "="*50 + "\n\n"
        
        for section_num, content in extracted_data.items():
            section_name = self.sections.get(section_num, '')
            formatted_output += f"{section_num}: {section_name}\n"
            formatted_output += "-"*50 + "\n"
            formatted_output += content + "\n\n"
            
        return formatted_output
