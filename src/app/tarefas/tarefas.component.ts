import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';

import { TarefasService, ITarefa, StatusEnum } from './tarefas.service';

@Component({
  selector: 'app-tarefas',
  templateUrl: './tarefas.component.html',
  styleUrls: ['./tarefas.component.scss']
})
export class TarefasComponent implements OnInit {

  CADASTRAR_TAREFA = 'Cadastrar tarefa';
  EDITAR_TAREFA = 'Editar tarefa';
  titleForm = this.CADASTRAR_TAREFA;
  displayedColumns: string[] = [
    'id', 'descricao', 'observacao', 'dataCriacao', 'dataModificacao', 'status', 'acoes'
  ];
  list: ITarefa[] = [];
  form = this._formBuilder.group({
    id: new FormControl<string | number>({ value: '', disabled: true }),
    descricao: ['', [Validators.required]],
    observacao: [''],
    status: new FormControl<StatusEnum>(StatusEnum.PENDENTE)
  });
  statusList = [
    { value: StatusEnum.PENDENTE, description: 'pendente' },
    { value: StatusEnum.FAZENDO, description: 'fazendo' },
    { value: StatusEnum.FEITO, description: 'feito' },
    { value: StatusEnum.CANCELADO, description: 'cancelado' },
  ];
  isLoadingSalvar = false;
  isLoadingListar = false;
  statusEnum = StatusEnum;

  constructor(private tarefasService: TarefasService, private _formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.listar();
  }

  listar(): void {
    this.isLoadingListar = true;
    this.tarefasService.listar().subscribe(
      data => {
        this.list = data;
        this.isLoadingListar = false;
      },
      () => this.isLoadingListar = false
    );
  }

  listarClick(): void {
    this.listar();
  }

  getStatusEnum(statusForm: FormControl): StatusEnum {
    if (statusForm) {
      return statusForm.value;
    }
    return StatusEnum.PENDENTE;
  }

  limparClick(): void {
    this.form.reset();
    this.titleForm = this.CADASTRAR_TAREFA;
  }

  salvarClick(): void {
    if (this.form.invalid) {
      return;
    }
    this.form.disable();
    this.isLoadingSalvar = true;
    const { id, descricao, observacao, status } = this.form.controls;

    const tarefa: ITarefa = {
      descricao: descricao.value || '',
      observacao: observacao.value || '',
      dataCriacao: new Date(),
      dataModificacao: new Date(),
      status: null
    }

    if (id.value && id.value?.toString() !== '') {
      tarefa.id = id.value;
      const statusEnum = this.getStatusEnum(status);
      tarefa.status = statusEnum;
      this.tarefasService.editar(tarefa).subscribe(
        () => {
          this.listar();
          this.clearForm();
        },
        () => this.isLoadingSalvar = false
      );
    } else {
      tarefa.status = StatusEnum.PENDENTE;
      this.tarefasService.salvar(tarefa).subscribe(
        () => {
          this.listar();
          this.clearForm();
        },
        () => this.isLoadingSalvar = false
      );
    }
  }

  clearForm(): void {
    this.form.reset();
    this.isLoadingSalvar = false;
    this.titleForm = this.CADASTRAR_TAREFA;
    this.form.enable();
  }

  editarClick(tarefa: ITarefa): void {
    this.form.setValue(
      { id: tarefa?.id?.toString() || null, descricao: tarefa.descricao, observacao: tarefa.observacao, status: tarefa.status }
    );
    this.titleForm = this.EDITAR_TAREFA;
  }

  removerClick(tarefa: ITarefa): void {
    this.tarefasService.remover(tarefa).subscribe(() => this.listar());
  }

  alterarStatusClick(tarefa: ITarefa, status: StatusEnum): void {
    if (!tarefa.id) {
      return;
    }
    this.tarefasService.alterarStatus(tarefa.id, status).subscribe(() => this.listar());
  }

  getNgClass(status: StatusEnum) {
    console.log('status => ', status);
    return '';
    if (status === StatusEnum.PENDENTE) {
      return 'circle--pendente';
    }
    if (status === StatusEnum.FAZENDO) {
      return 'circle--fazendo';
    }
    if (status === StatusEnum.FEITO) {
      return 'circle--feito';
    }
    return 'circle--cancelado';
  }

}
