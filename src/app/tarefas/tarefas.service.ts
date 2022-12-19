import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

export enum StatusEnum {
  PENDENTE = 'pendente',
  FAZENDO = 'fazendo',
  FEITO = 'feito',
  CANCELADO = 'cancelado'
}

export interface ITarefa {
  id?: string | number | null;
  descricao: string;
  observacao: string;
  dataCriacao?: Date;
  dataModificacao?: Date;
  status?: StatusEnum | null;
}

@Injectable({
  providedIn: 'root'
})
export class TarefasService {

  apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  listar(): Observable<ITarefa[]> {
    return this.http.get<ITarefa[]>(`${this.apiUrl}/tarefas`);
  }

  getById(id: string | number): Observable<ITarefa> {
    return this.http.get<ITarefa>(`${this.apiUrl}/tarefas/${id}`);
  }

  salvar(tarefa: ITarefa): Observable<ITarefa[]> {
    return this.http.post<ITarefa[]>(`${this.apiUrl}/tarefas`, tarefa);
  }

  editar(tarefa: ITarefa): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/tarefas/${tarefa.id}`, tarefa);
  }

  remover(tarefa: ITarefa): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/tarefas/${tarefa.id}`);
  }

  alterarStatus(id: string | number, status: StatusEnum): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/tarefas/${id}`, { status });
  }
}
