/**
 * 조건부 로직 처리
 * 템플릿 메시지에서 조건부 분기 처리
 */

export interface Condition {
  variable: string;
  operator: '>' | '<' | '>=' | '<=' | '==' | '!=' | 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: string | number;
}

/**
 * 조건 평가
 */
export function evaluateCondition(
  condition: Condition,
  variables: Record<string, string>
): boolean {
  const varValue = variables[condition.variable];
  if (varValue === undefined) {
    return false;
  }

  // 연산자 매핑
  let operator = condition.operator;
  if (operator === 'equals') operator = '==';
  if (operator === 'not_equals') operator = '!=';
  if (operator === 'greater_than') operator = '>';
  if (operator === 'less_than') operator = '<';

  // contains 연산자 처리 (문자열 전용)
  if (operator === 'contains') {
    return String(varValue).includes(String(condition.value));
  }

  // 숫자 비교가 필요한 연산자인지 확인
  const isNumericOperator = ['>', '<', '>=', '<=', 'greater_than', 'less_than'].includes(operator);
  
  // 값들이 숫자로 변환 가능한지 확인
  const numVarValue = Number(varValue);
  const numConditionValue = Number(condition.value);
  const areBothNumbers = !isNaN(numVarValue) && !isNaN(numConditionValue);

  if (isNumericOperator || (areBothNumbers && typeof condition.value !== 'string')) {
    // 숫자 비교 수행
    switch (operator) {
      case '>':
        return numVarValue > numConditionValue;
      case '<':
        return numVarValue < numConditionValue;
      case '>=':
        return numVarValue >= numConditionValue;
      case '<=':
        return numVarValue <= numConditionValue;
      case '==':
        return numVarValue === numConditionValue;
      case '!=':
        return numVarValue !== numConditionValue;
    }
  }

  // 문자열 비교 (기본)
  switch (operator) {
    case '==':
      return String(varValue) === String(condition.value);
    case '!=':
      return String(varValue) !== String(condition.value);
    default:
      return false;
  }
}

/**
 * 조건부 텍스트 파싱 및 처리
 * 
 * 형식: {{if variable > value}}텍스트{{else}}대체 텍스트{{/if}}
 */
export function processConditionalText(
  content: string,
  variables: Record<string, string>
): string {
  // {{if condition}}true_text{{else}}false_text{{/if}} 패턴 찾기
  // 멀티라인 매칭을 위해 [\s\S] 사용
  const ifElseRegex = /\{\{if\s+(\w+)\s*([><=!]+)\s*([^}]+)\}\}([\s\S]*?)\{\{else\}\}([\s\S]*?)\{\{\/if\}\}/g;
  
  let result = content;
  let match;
  const processedMatches: string[] = [];

  while ((match = ifElseRegex.exec(content)) !== null) {
    if (processedMatches.includes(match[0])) continue;
    processedMatches.push(match[0]);
    
    const [, variable, operator, value, trueText, falseText] = match;
    
    // 연산자 정규화
    let normalizedOperator = operator.trim();
    if (normalizedOperator === '=') normalizedOperator = '==';
    
    const condition: Condition = {
      variable: variable.trim(),
      operator: normalizedOperator as Condition['operator'],
      value: isNaN(Number(value.trim())) ? value.trim() : Number(value.trim()),
    };

    const isTrue = evaluateCondition(condition, variables);
    const replacement = isTrue ? trueText.trim() : falseText.trim();
    
    result = result.replace(match[0], replacement);
  }

  // {{if condition}}text{{/if}} 패턴 (else 없음)
  const ifOnlyRegex = /\{\{if\s+(\w+)\s*([><=!]+)\s*([^}]+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
  processedMatches.length = 0; // 초기화
  
  while ((match = ifOnlyRegex.exec(result)) !== null) {
    if (processedMatches.includes(match[0])) continue;
    processedMatches.push(match[0]);
    
    const [, variable, operator, value, text] = match;
    
    // 연산자 정규화
    let normalizedOperator = operator.trim();
    if (normalizedOperator === '=') normalizedOperator = '==';
    
    const condition: Condition = {
      variable: variable.trim(),
      operator: normalizedOperator as Condition['operator'],
      value: isNaN(Number(value.trim())) ? value.trim() : Number(value.trim()),
    };

    const isTrue = evaluateCondition(condition, variables);
    const replacement = isTrue ? text.trim() : '';
    
    result = result.replace(match[0], replacement);
  }

  return result;
}

/**
 * 조건부 텍스트에서 사용된 변수 추출
 */
export function extractConditionVariables(content: string): string[] {
  const variables: string[] = [];
  const ifRegex = /\{\{if\s+(\w+)\s*[><=!]+\s*[^}]+\}\}/g;
  let match;

  while ((match = ifRegex.exec(content)) !== null) {
    const variable = match[1];
    if (!variables.includes(variable)) {
      variables.push(variable);
    }
  }

  return variables;
}

